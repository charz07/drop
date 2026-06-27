import os
from fastapi import APIRouter
from groq import AsyncGroq
from dotenv import load_dotenv
from services.database import get_user_profile, get_all_reacted_brands

load_dotenv()

router = APIRouter()
client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])


@router.get("/")
async def user_profile(user_id: str):
    all_brands = get_all_reacted_brands(user_id)
    ranked_brands = get_user_profile(user_id)

    summary = None
    if ranked_brands:
        top_brands = [b for b in ranked_brands if b["rank"] <= 2] or ranked_brands[:2]
        brand_lines = "\n".join(
            f"- {b['name']} (ranked #{b['rank']}): {b['description']}"
            for b in top_brands
        )
        prompt = (
            "Based on the brands this person has consistently ranked highest, "
            "write 2 sentences describing their taste profile using 'you' as the pronoun. "
            "Be specific about flavors, textures, and sensory qualities. "
            "Do not name the brands. Do not use marketing language.\n\n"
            f"Their top-ranked brands:\n{brand_lines}"
        )
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
        )
        summary = response.choices[0].message.content.strip()

    return {"brands": all_brands, "summary": summary}
