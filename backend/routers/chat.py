import os
from fastapi import APIRouter
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM_PROMPT = """You are a knowledgeable, curious food friend helping someone discover their taste for Drop — a CPG brand discovery app. Your job is to understand their palate through natural conversation, then find them brands they'll love.

Gather these signals naturally across the conversation — don't ask about them in order like a checklist:
- What flavors, textures, vibes they gravitate toward
- Specific brands or products they love or have tried recently (highest signal)
- Heat tolerance
- What they actively avoid
- Dietary restrictions
- What they're hoping to discover or find

Tone rules:
- Always write in lowercase
- Be warm and genuinely curious — like texting a friend who really knows food
- React to what they say before asking the next thing ("oh interesting", "that's a specific palate")
- Ask one focused question at a time, never a list of questions
- Follow threads — if they mention something specific, go deeper before moving on

Conversation rules:
- The first message has already been sent — don't repeat it
- Let the conversation breathe naturally — don't rush to wrap up
- When you genuinely have enough signal to find them good brands (usually after 4-7 user messages), close the conversation naturally and add [DONE] on a new line at the very end of your message
- Never mention [DONE] in the conversational part of your message"""

SYNTHESIS_PROMPT = """Based on this taste conversation, write a detailed taste profile for embedding-based CPG brand matching.

Be specific and include:
- Exact brands and products they mentioned
- Flavor preferences (sweet, savory, spicy, umami, acidic, bitter, etc.)
- Texture preferences
- Heat tolerance
- What they actively avoid
- Dietary restrictions
- Any specific intent or goal (health, discovery, occasion, etc.)

Write as a rich, natural first-person paragraph. The more specific, the better. No bullet points. No marketing language."""


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
        max_tokens=300,
        temperature=0.85,
    )

    raw = response.choices[0].message.content.strip()
    done = "[DONE]" in raw
    message = raw.replace("[DONE]", "").strip()

    taste_description = None
    if done:
        convo = build_convo_text(messages) + f"\nassistant: {message}"
        synthesis = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYNTHESIS_PROMPT},
                {"role": "user", "content": convo},
            ],
            max_tokens=400,
            temperature=0.3,
        )
        taste_description = synthesis.choices[0].message.content.strip()

    return {"message": message, "done": done, "taste_description": taste_description}
