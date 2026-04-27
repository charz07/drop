import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])


async def generate_rationale(taste_description: str, brand_name: str, brand_description: str) -> str:
    prompt = (
        f"A user described their taste as: \"{taste_description}\"\n\n"
        f"They were matched with: {brand_name} — {brand_description}\n\n"
        "Write one sentence explaining why this brand fits their taste. "
        "Be specific and sensory. Do not start with 'This brand' or 'Because'. "
        "Do not use marketing language."
    )
    response = await client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=80,
    )
    return response.choices[0].message.content.strip()


async def generate_rationales(taste_description: str, brands: list[dict]) -> list[str]:
    return await asyncio.gather(*[
        generate_rationale(taste_description, brand["name"], brand["description"])
        for brand in brands
    ])
