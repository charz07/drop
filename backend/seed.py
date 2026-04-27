import os
from dotenv import load_dotenv
from supabase import create_client
from services.embeddings import embed_text
from services.database import SEED_BRANDS

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])


def seed():
    print(f"Embedding and inserting {len(SEED_BRANDS)} brands...")
    for brand in SEED_BRANDS:
        print(f"  → {brand['name']}")
        vector = embed_text(brand["description"])
        supabase.table("brands").insert({
            "name": brand["name"],
            "description": brand["description"],
            "vector": vector,
        }).execute()
    print("Done.")


if __name__ == "__main__":
    seed()
