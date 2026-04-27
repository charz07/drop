import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def embed_text(text: str) -> list[float]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )
    return result.embeddings[0].values


def embed_brand_catalog(brands: list[dict]) -> list[dict]:
    return [{**brand, "vector": embed_text(brand["description"])} for brand in brands]
