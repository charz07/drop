import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"]
)


SEED_BRANDS = [
    {"name": "Fly By Jing", "description": "Bold Sichuan chili sauces with numbing heat, deep umami, and fermented complexity. Layered spice that builds slowly with a savory, almost smoky finish. For people who want heat with substance."},
    {"name": "Diaspora Co.", "description": "Single-origin Indian spices with bright, aromatic intensity. Turmeric with earthy warmth, pepper with floral heat, chili with fruity depth. Clean and vivid — nothing muddled."},
    {"name": "Omsom", "description": "Southeast Asian sauce starters — punchy, loud, unapologetically bold. Fish sauce funk, lemongrass brightness, and chili heat. Fast flavor with Southeast Asian pantry depth."},
    {"name": "Acid League", "description": "Living vinegars and shrubs with sharp acidity, unusual fruit pairings, and fermented tang from raw, unfiltered fermentation. Tart, complex, and slightly funky. For people who love pickles, ferments, and bright acidic contrast."},
    {"name": "Graza", "description": "Single-origin Spanish olive oil with fresh, grassy fruitiness and a clean peppery finish. Light enough for drizzling, robust enough to taste. Bright and green, not heavy."},
    {"name": "Fishwife", "description": "Sustainably tinned fish with rich, briny depth — smoked salmon, anchovies, rainbow trout. Umami-forward with a clean ocean salinity. For people who love charcuterie boards and salty, fatty bites."},
    {"name": "Nguyen Coffee Supply", "description": "Vietnamese robusta coffee — stronger, earthier, and more caffeinated than typical arabica. Bitter cocoa notes with a thick, syrupy body. Best with condensed milk or black for intensity seekers."},
    {"name": "Joyride", "description": "Better-for-you sour candy and gummies made with natural fruit flavors and no artificial dyes. Bold sweet-tart profiles — think sour worms, fruit chews, and sour smacks — with clean ingredient lists. For people who want the candy experience without the junk."},
    {"name": "Magic Spoon", "description": "High-protein breakfast cereal with nostalgic sweetness — fruity, frosted, and cocoa flavors reminiscent of childhood cereals but made with sugar alternatives. Light, crunchy, and dessert-adjacent."},
    {"name": "Taika", "description": "Oat milk lattes with adaptogens and nootropics — smooth, lightly sweet, and coffee-forward with a calm, functional edge. For people who want coffee ritual with functional ingredients."},
    {"name": "Banza", "description": "Plant-based chickpea pasta with a nutty, dense texture and subtle earthy undertones. High in protein and fiber with a hearty mouthfeel that mellows into creamy richness when coated with sauce. For people who want pasta that actually fills them up."},
    {"name": "Chuza", "description": "Mexican-inspired dried fruit snacks with a vibrant sweet-heat balance — juicy mango, strawberry, and pineapple hit with an authentic chili spice blend that delivers layered heat without overwhelming burn. Crave-worthy savory-fruity contrast."},
    {"name": "Three Wishes", "description": "Grain-free cereal made from chickpea and tapioca with a light, airy crunch and subtle legume sweetness. Cinnamon-honey and cocoa flavors deliver warm spice and richness without heavy grain mouthfeel. Minimal sugar, high protein."},
    {"name": "Sun Tropics", "description": "Crispy mochi rice puffs with boldly savory Asian flavor profiles — sea salt delivers clean salinity, golden curry brings warm turmeric and coconut depth, Thai bird sriracha combines fruity heat with fermented tang. Delicate and airy texture."},
    {"name": "Clio Snacks", "description": "Greek yogurt bars wrapped in a thin chocolate shell — cooling yogurt tang and probiotic brightness balanced against cocoa richness and vanilla sweetness. Satisfying contrast between dense, cheesecake-like filling and the snap of chocolate."},
    {"name": "That's It", "description": "Two-ingredient fruit bars with intense, concentrated flavor — pure apple-base sweetness layered with bright berry tartness, tropical mango, or dark cherry earthiness. No added sugar, just firm chewy texture and pure fruit taste."},
    {"name": "Kite Hill", "description": "Almond milk Greek yogurt with live cultures and a lighter mouthfeel than dairy. Mild almond nuttiness balanced with subtle vanilla creaminess or bright berry tartness. Smooth and luxurious without the heaviness of cow's milk yogurt."},
    {"name": "Kitu Super Coffee", "description": "Ready-to-drink coffee with organic Colombian beans, MCT oil, and zero added sugar. Clean coffee brightness without bitterness, with a creamy-rich mouthfeel from the MCT and balanced caramel or vanilla sweetness. Sustained energy, no crash."},
    {"name": "Carbone", "description": "Premium slow-cooked pasta sauces with fresh tomato body, bright acidity, and restaurant-level depth. Vodka sauce brings spicy fermented complexity, four-cheese delivers Parmesan-Romano funk, black truffle adds earthy mushroom aromatics. Indulgent and ingredient-forward."},
    {"name": "Barnana", "description": "Upcycled banana snacks with concentrated tropical sweetness and a chewy, toothsome texture. Natural caramel-like depth from ripened banana sugars, with spiced varieties adding warm cardamom or cinnamon. Simple, fruity, and satisfying."},
]


def fetch_brand_catalog() -> list[dict]:
    response = supabase.table("brands").select("id, name, description, vector").execute()
    return response.data


def ensure_user_exists(user_id: str):
    supabase.table("users").upsert({"id": user_id}).execute()


def get_drop_history(user_id: str) -> list[str]:
    response = (
        supabase.table("drop_history")
        .select("brand_id")
        .eq("user_id", user_id)
        .execute()
    )
    return [row["brand_id"] for row in response.data]


def save_drop_history(user_id: str, brand_ids: list[str]):
    rows = [{"user_id": user_id, "brand_id": bid} for bid in brand_ids]
    supabase.table("drop_history").insert(rows).execute()


def save_rankings(user_id: str, rankings: list[dict]):
    rows = [{"user_id": user_id, "brand_id": r["brand_id"], "rank": r["rank"]} for r in rankings]
    supabase.table("rankings").upsert(rows, on_conflict="user_id,brand_id").execute()


def get_user_ranked_brands(user_id: str) -> list[dict]:
    response = (
        supabase.table("rankings")
        .select("rank, brands(vector)")
        .eq("user_id", user_id)
        .execute()
    )
    return [{"rank": row["rank"], "vector": row["brands"]["vector"]} for row in response.data]
