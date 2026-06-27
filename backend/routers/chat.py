import asyncio
import os
import json
import re
from fastapi import APIRouter
from groq import AsyncGroq
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
_tavily_key = os.environ.get("TAVILY_API_KEY")
tavily = TavilyClient(api_key=_tavily_key) if _tavily_key else None

SYSTEM_PROMPT = """You are a food-obsessed friend helping someone get matched with emerging CPG brands. Text like a human — lowercase, brief, warm. One question per message.

You need exactly these signals before wrapping up:
1. specific brands or products they love
2. what they avoid or dislike
3. dietary restrictions or eating goals (vegan, high protein, gluten-free, etc.)
4. heat tolerance

Collect them naturally through conversation — don't ask in order, don't telegraph the list. Once you have all four, close with a statement and add [DONE] on its own line. Don't keep going once you have what you need.

Good questions: what have you been into lately, any brands you always grab, anything you'd never buy, how do you feel about spice.
Bad questions: why do you like X, what is it about X that appeals to you, tell me more about your relationship with food.

Brand rule: when someone mentions a specific brand name (like "Wilde", "Omsom", "Graza"), always use the search tool before reacting — even ones you think you know. Do NOT search for generic foods, fruits, or ingredients. Never mention that you searched.

[DONE] only after a closing statement, never after a question."""

DIETARY_PROMPT = """From this food/drink taste conversation, extract the person's dietary restrictions and fitness/eating goals.

Return ONLY valid JSON in this exact shape:
{
  "restrictions": ["list of dietary restrictions mentioned, e.g. vegan, gluten-free, dairy-free, nut allergy, kosher, halal"],
  "goals": ["list of eating or fitness goals, e.g. high protein, low sugar, low carb, high fiber, weight loss, muscle gain, gut health, clean eating"]
}

Use only what was explicitly stated or clearly implied. If nothing was mentioned, return empty arrays. No explanations, no markdown — just the JSON object."""

SYNTHESIS_PROMPT = """Based on this taste conversation, write a detailed taste profile for embedding-based CPG brand matching.

Be specific and include:
- Exact brands and products they mentioned, with their flavor profile (bold, umami, spicy, sweet, fermented, etc.)
- Flavor preferences (sweet, savory, spicy, umami, acidic, bitter, etc.)
- Heat tolerance
- What they actively avoid
- Dietary restrictions and eating goals (vegan, high protein, gluten-free, low sugar, fitness-focused, etc.)
- Any specific discovery intent (health, novelty, snacking, meals, etc.)

For any brand mentioned, describe its actual flavor character — don't just repeat the name.
Write as a rich, natural first-person paragraph. The more specific, the better. No bullet points. No marketing language."""

SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "search_brand",
        "description": "Look up a specific food or beverage brand (proper-noun company or product name) to understand its flavor profile, ingredients, and vibe. Only use for actual brand names — NOT for generic foods, fruits, vegetables, or common ingredients.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query, e.g. 'Wilde protein chips flavor' or 'Ghia non-alcoholic aperitif taste'"
                }
            },
            "required": ["query"]
        }
    }
}

# Catches inline tool call syntax that llama sometimes leaks into content
INLINE_TOOL_RE = re.compile(r'<function=search_brand>(.*?)</function>', re.DOTALL)


def run_search(query: str) -> str:
    if not tavily:
        return ""
    try:
        result = tavily.search(query=query, max_results=3, search_depth="basic")
        snippets = [r.get("content", "") for r in result.get("results", []) if r.get("content")]
        return " ".join(snippets[:3])[:1200]
    except Exception:
        return ""


async def call_with_search_result(messages: list, search_result: str) -> str:
    """Re-call the LLM with search results appended to the system prompt."""
    augmented_system = SYSTEM_PROMPT + f"\n\n[Brand lookup result: {search_result}]"
    followup = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": augmented_system}] + messages,
        max_tokens=300,
        temperature=0.92,
    )
    return followup.choices[0].message.content.strip()


def build_convo_text(messages):
    return "\n".join(
        f"{'user' if m['role'] == 'user' else 'assistant'}: {m['content']}"
        for m in messages
    )


@router.post("/")
async def chat(body: dict):
    messages = body.get("messages", [])

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        tools=[SEARCH_TOOL],
        tool_choice="auto",
        max_tokens=300,
        temperature=0.92,
    )

    choice = response.choices[0]

    if choice.finish_reason == "tool_calls":
        # Clean structured tool call
        tool_call = choice.message.tool_calls[0]
        args = json.loads(tool_call.function.arguments)
        search_result = run_search(args["query"])

        tool_messages = [
            {"role": "assistant", "content": None, "tool_calls": [
                {
                    "id": tool_call.id,
                    "type": "function",
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments,
                    }
                }
            ]},
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": search_result or "No results found.",
            }
        ]

        followup = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages + tool_messages,
            max_tokens=300,
            temperature=0.92,
        )
        raw = followup.choices[0].message.content.strip()
    else:
        raw = (choice.message.content or "").strip()

        # Detect inline tool call leakage — llama sometimes puts <function=...> in content
        inline_match = INLINE_TOOL_RE.search(raw)
        if inline_match:
            try:
                args = json.loads(inline_match.group(1))
                search_query = args.get("query", "")
            except (json.JSONDecodeError, KeyError):
                search_query = ""

            if search_query:
                search_result = run_search(search_query)
                raw = await call_with_search_result(messages, search_result)
            else:
                raw = INLINE_TOOL_RE.sub("", raw).strip()

    done = "[DONE]" in raw
    message = raw.replace("[DONE]", "").strip()

    taste_description = None
    dietary_profile = None
    if done:
        convo = build_convo_text(messages) + f"\nassistant: {message}"
        synthesis, dietary_resp = await asyncio.gather(
            client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYNTHESIS_PROMPT},
                    {"role": "user", "content": convo},
                ],
                max_tokens=400,
                temperature=0.3,
            ),
            client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": DIETARY_PROMPT},
                    {"role": "user", "content": convo},
                ],
                max_tokens=200,
                temperature=0.1,
            ),
        )
        taste_description = synthesis.choices[0].message.content.strip()
        try:
            dietary_profile = json.loads(dietary_resp.choices[0].message.content.strip())
        except (json.JSONDecodeError, AttributeError):
            dietary_profile = {"restrictions": [], "goals": []}

    return {"message": message, "done": done, "taste_description": taste_description, "dietary_profile": dietary_profile}
