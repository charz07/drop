import os
from dotenv import load_dotenv
from supabase import create_client
from services.embeddings import embed_text
from services.database import SEED_BRANDS, NEW_BRANDS

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])


def seed(brands):
    print(f"Embedding and inserting {len(brands)} brands...")
    for brand in brands:
        print(f"  → {brand['name']}")
        vector = embed_text(brand["description"])
        supabase.table("brands").insert({
            "name": brand["name"],
            "description": brand["description"],
            "vector": vector,
        }).execute()
    print("Done.")


if __name__ == "__main__":
    seed(NEW_BRANDS)
