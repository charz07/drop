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


def update_urls(brands):
    print(f"Updating URLs for {len(brands)} brands...")
    for brand in brands:
        if not brand.get("url"):
            continue
        supabase.table("brands").update({"url": brand["url"]}).eq("name", brand["name"]).execute()
        print(f"  → {brand['name']}")
    print("Done.")


def update_images(brands):
    print(f"Updating images for {len(brands)} brands...")
    for brand in brands:
        if not brand.get("image_url"):
            continue
        supabase.table("brands").update({"image_url": brand["image_url"]}).eq("name", brand["name"]).execute()
        print(f"  → {brand['name']}")
    print("Done.")


def update_tags(brands):
    print(f"Updating tags for {len(brands)} brands...")
    for brand in brands:
        if not brand.get("tags"):
            continue
        supabase.table("brands").update({"tags": brand["tags"]}).eq("name", brand["name"]).execute()
        print(f"  → {brand['name']}")
    print("Done.")


if __name__ == "__main__":
    update_tags(SEED_BRANDS + NEW_BRANDS)
