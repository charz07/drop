import os
from dotenv import load_dotenv
from supabase import create_client
from services.embeddings import embed_text
from services.database import SEED_BRANDS, NEW_BRANDS

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])


def seed(brands):
    existing = {r["name"] for r in supabase.table("brands").select("name").execute().data}
    to_insert = [b for b in brands if b["name"] not in existing]
    if not to_insert:
        print("All brands already seeded.")
        return
    print(f"Embedding and inserting {len(to_insert)} brands...")
    for brand in to_insert:
        print(f"  → {brand['name']}")
        vector = embed_text(brand["description"])
        supabase.table("brands").insert({
            "name": brand["name"],
            "description": brand["description"],
            "vector": vector,
        }).execute()
    print("Done.")


def update_field(brands, field):
    print(f"Updating {field} for {len(brands)} brands...")
    for brand in brands:
        if not brand.get(field):
            continue
        supabase.table("brands").update({field: brand[field]}).eq("name", brand["name"]).execute()
        print(f"  → {brand['name']}")
    print("Done.")


if __name__ == "__main__":
    all_brands = SEED_BRANDS + NEW_BRANDS
    update_field(all_brands, "url")
    update_field(all_brands, "image_url")
    update_field(all_brands, "tags")
