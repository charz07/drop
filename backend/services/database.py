import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"]
)


NEW_BRANDS = [
    {"name": "Olipop", "url": "https://drinkolipop.com", "description": "Prebiotic soda built on botanical fiber blends — vintage cola, cream soda, and cherry vanilla with lighter sweetness and a faint herbal undertone from root and bark extracts. Less sweet than regular soda with gentle carbonation and a clean finish. For people who want soda nostalgia without the sugar crash."},
    {"name": "Poppi", "url": "https://drinkpoppi.com", "description": "Fruit-forward prebiotic soda with apple cider vinegar woven in — watermelon, raspberry rose, ginger lime — lending bright tartness that sharpens the fruit without tasting like vinegar. Light and refreshing, closer to sparkling juice than soda. For people who want something sweet but with a tangy, functional edge."},
    {"name": "Momofuku", "url": "https://momofuku.com", "description": "Air-dried noodles with serious springy chew, plus a Chili Crunch built from three chili varieties, crispy garlic, shallots, and sesame in smoky oil. The Tingly variety adds Sichuan peppercorn numbing heat that builds slowly. Umami-forward with layers of crunch, heat, and savory depth."},
    {"name": "Brightland", "url": "https://brightland.co", "description": "Cold-pressed California extra-virgin olive oil from heirloom olives harvested and pressed within 90 minutes. Bright, grassy, and fruity with a clean peppery finish that signals freshness. The flavor is too vivid to cook away — best for finishing and drizzling."},
    {"name": "Burlap & Barrel", "url": "https://burlapandbarrel.com", "description": "Single-origin spices sourced directly from small farms — Aleppo pepper with fruity warmth and mild heat, Black Urfa chili with smoky earthiness, Royal Cinnamon with floral sweetness unlike any jar on a grocery shelf. Dramatically more vivid than commodity spices. For people who cook with intention."},
    {"name": "Siete Foods", "url": "https://sietefoods.com", "description": "Grain-free tortilla chips from cassava and coconut flour with a light, airy crunch and subtle buttery flavor — cleaner and less heavy than corn. Lime delivers bright citrus pop, sea salt is simple and addictive. For people who want a chip that doesn't leave you feeling weighed down."},
    {"name": "De La Calle", "url": "https://www.delacalle.com", "description": "Canned tepache — traditional Mexican fermented pineapple drink — lighter than kombucha, sweeter than shrubs, with gentle tropical fruitiness and mild spice from cinnamon and pepper. Soft effervescence and no vinegary funk. For people who want a fermented drink without the acquired taste."},
    {"name": "Sunwink", "url": "https://drinksunwink.com", "description": "Lightly effervescent herbal sparkling tonics — Lemon Rose with bright citrus and floral zing, Detox Ginger with clean spice and no syrupy sweetness, Hibiscus Mint with tart berry coolness. Botanical complexity without bitterness or stevia aftertaste. For people who want sparkling water that actually tastes like something."},
    {"name": "Solely", "url": "https://eatsolely.com", "description": "Single-ingredient whole fruit jerky — mango, pineapple, guava — with no added sugar, just concentrated fruit flavor and a soft, pliable chew that's less sticky than fruit leather. Mango is intensely tropical, pineapple is bright and acidic. For people who want a snack that tastes like the actual fruit."},
    {"name": "Seed + Mill", "url": "https://seedandmill.com", "description": "Ultra-smooth tahini made exclusively from Ethiopian Humera sesame seeds — nutty, lightly bitter, and deeply rich with a pourable consistency that hardly needs stirring. Roasted Garlic adds caramelized depth; Za'atar brings earthy tartness. For people who think tahini should be a destination ingredient, not a condiment."},
    {"name": "Kettle & Fire", "url": "https://www.kettleandfire.com", "description": "Slow-simmered bone broth from grass-fed beef and pasture-raised chicken — deep, collagen-rich, and savory with a clean meaty depth that store broth can't match. Turmeric Ginger adds warming spice and anti-inflammatory complexity. Rich enough to sip straight, versatile enough to build a sauce around."},
    {"name": "LesserEvil", "url": "https://lesserevil.com", "description": "Organic popcorn air-popped in coconut oil with Himalayan pink salt — light and crispy with subtle coconutty butteriness and clean, balanced saltiness. No artificial anything. For people who want popcorn that tastes like popcorn, not a flavor lab experiment."},
    {"name": "Lavva", "url": "https://eatlavva.com", "description": "Pili nut and plantain yogurt with live cultures — naturally creamy from pili nut fat, lightly sweet from plantain, with gentle tang and a soft coconut undertone. No added gums or sugar. Lighter in body than dairy Greek yogurt with a clean, uncluttered finish."},
    {"name": "Good Culture", "url": "https://goodculture.com", "description": "Cottage cheese made with cold-fermented whole milk and six live cultures — creamy, fresh, and gently tangy in a way that mass-market brands lack. Less salty than most with a soft curd texture. Works sweet with fruit or savory with olive oil equally well."},
    {"name": "Minna", "url": "https://drinkwithminna.com", "description": "Sparkling brewed tea — Peach Yuzu Green, Lime Hibiscus Rooibos, Pineapple Passionfruit — with real brewed tea flavor, delicate effervescence, and zero sugar or sweeteners. Tastes like iced tea with natural fruit brightness, not like flavored water pretending to be tea."},
    {"name": "Sour Strips", "url": "https://sourstrips.com", "description": "Thick, chewy sour candy strips with sustained tartness that builds before mellowing into bold fruit flavor — blue raspberry, wild cherry, tropical mango. More intense than most candy-aisle sours without tipping into artificial harshness. For people who take their sour candy seriously."},
    {"name": "Deux", "url": "https://eatdeux.com", "description": "Functional cookie dough made from cashew butter, oat flour, and coconut sugar — Brownie Batter delivers rich cocoa depth, Chocolate Chip has genuine buttery sweetness, Mint Chocolate brings clean coolness. Softer and more spreadable than traditional dough. For people who eat cookie dough straight from the jar."},
    {"name": "Forager Project", "url": "https://foragerproject.com", "description": "Cashew and coconut milk yogurt with live probiotic cultures — mildly tangy, naturally creamy, with gentle cashew sweetness and a lighter body than dairy. Vanilla Bean and fruit varieties have clean flavor without artificial aftertaste. For people who want dairy-free yogurt that actually has the texture of yogurt."},
    {"name": "REBBL", "url": "https://rebbl.co", "description": "Coconut milk protein elixirs — Dark Chocolate with rich cocoa depth and a slight bitter edge, Vanilla Spice with horchata-like warmth and creaminess, Salted Caramel with indulgent balance. 20g plant protein without the chalky aftertaste. For people who want a meal replacement that tastes like dessert."},
    {"name": "Purely Elizabeth", "url": "https://purelyelizabeth.com", "description": "Ancient grain granola sweetened with coconut sugar — deeply toasty clusters with caramel-like depth, warm cinnamon, and a salty-sweet balance more complex than standard oat granola. Large chunks hold up in milk without going soggy. For people who think granola should be a flavor experience, not just a cereal backdrop."},
]

SEED_BRANDS = [
    {"name": "Fly By Jing", "url": "https://flybyjing.com", "description": "Bold Sichuan chili sauces with numbing heat, deep umami, and fermented complexity. Layered spice that builds slowly with a savory, almost smoky finish. For people who want heat with substance."},
    {"name": "Diaspora Co.", "url": "https://diasporaco.com", "description": "Single-origin Indian spices with bright, aromatic intensity. Turmeric with earthy warmth, pepper with floral heat, chili with fruity depth. Clean and vivid — nothing muddled."},
    {"name": "Omsom", "url": "https://omsom.com", "description": "Southeast Asian sauce starters — punchy, loud, unapologetically bold. Fish sauce funk, lemongrass brightness, and chili heat. Fast flavor with Southeast Asian pantry depth."},
    {"name": "Acid League", "url": "https://acidleague.com", "description": "Living vinegars and shrubs with sharp acidity, unusual fruit pairings, and fermented tang from raw, unfiltered fermentation. Tart, complex, and slightly funky. For people who love pickles, ferments, and bright acidic contrast."},
    {"name": "Graza", "url": "https://graza.co", "description": "Single-origin Spanish olive oil with fresh, grassy fruitiness and a clean peppery finish. Light enough for drizzling, robust enough to taste. Bright and green, not heavy."},
    {"name": "Fishwife", "url": "https://fishwife.com", "description": "Sustainably tinned fish with rich, briny depth — smoked salmon, anchovies, rainbow trout. Umami-forward with a clean ocean salinity. For people who love charcuterie boards and salty, fatty bites."},
    {"name": "Nguyen Coffee Supply", "url": "https://nguyencoffeesupply.com", "description": "Vietnamese robusta coffee — stronger, earthier, and more caffeinated than typical arabica. Bitter cocoa notes with a thick, syrupy body. Best with condensed milk or black for intensity seekers."},
    {"name": "Joyride", "url": "https://joyridecandy.com", "description": "Better-for-you sour candy and gummies made with natural fruit flavors and no artificial dyes. Bold sweet-tart profiles — think sour worms, fruit chews, and sour smacks — with clean ingredient lists. For people who want the candy experience without the junk."},
    {"name": "Magic Spoon", "url": "https://magicspoon.com", "description": "High-protein breakfast cereal with nostalgic sweetness — fruity, frosted, and cocoa flavors reminiscent of childhood cereals but made with sugar alternatives. Light, crunchy, and dessert-adjacent."},
    {"name": "Taika", "url": "https://taika.co", "description": "Oat milk lattes with adaptogens and nootropics — smooth, lightly sweet, and coffee-forward with a calm, functional edge. For people who want coffee ritual with functional ingredients."},
    {"name": "Banza", "url": "https://eatbanza.com", "description": "Plant-based chickpea pasta with a nutty, dense texture and subtle earthy undertones. High in protein and fiber with a hearty mouthfeel that mellows into creamy richness when coated with sauce. For people who want pasta that actually fills them up."},
    {"name": "Chuza", "url": "https://www.chuza.com", "description": "Mexican-inspired dried fruit snacks with a vibrant sweet-heat balance — juicy mango, strawberry, and pineapple hit with an authentic chili spice blend that delivers layered heat without overwhelming burn. Crave-worthy savory-fruity contrast."},
    {"name": "Three Wishes", "url": "https://threewishescereal.com", "description": "Grain-free cereal made from chickpea and tapioca with a light, airy crunch and subtle legume sweetness. Cinnamon-honey and cocoa flavors deliver warm spice and richness without heavy grain mouthfeel. Minimal sugar, high protein."},
    {"name": "Sun Tropics", "url": "https://suntropics.com", "description": "Crispy mochi rice puffs with boldly savory Asian flavor profiles — sea salt delivers clean salinity, golden curry brings warm turmeric and coconut depth, Thai bird sriracha combines fruity heat with fermented tang. Delicate and airy texture."},
    {"name": "Clio Snacks", "url": "https://cliosnacks.com", "description": "Greek yogurt bars wrapped in a thin chocolate shell — cooling yogurt tang and probiotic brightness balanced against cocoa richness and vanilla sweetness. Satisfying contrast between dense, cheesecake-like filling and the snap of chocolate."},
    {"name": "That's It", "url": "https://thatsitfruit.com", "description": "Two-ingredient fruit bars with intense, concentrated flavor — pure apple-base sweetness layered with bright berry tartness, tropical mango, or dark cherry earthiness. No added sugar, just firm chewy texture and pure fruit taste."},
    {"name": "Kite Hill", "url": "https://www.kite-hill.com", "description": "Almond milk Greek yogurt with live cultures and a lighter mouthfeel than dairy. Mild almond nuttiness balanced with subtle vanilla creaminess or bright berry tartness. Smooth and luxurious without the heaviness of cow's milk yogurt."},
    {"name": "Kitu Super Coffee", "url": "https://drinksupercoffee.com", "description": "Ready-to-drink coffee with organic Colombian beans, MCT oil, and zero added sugar. Clean coffee brightness without bitterness, with a creamy-rich mouthfeel from the MCT and balanced caramel or vanilla sweetness. Sustained energy, no crash."},
    {"name": "Carbone", "url": "https://carbonefinefood.com", "description": "Premium slow-cooked pasta sauces with fresh tomato body, bright acidity, and restaurant-level depth. Vodka sauce brings spicy fermented complexity, four-cheese delivers Parmesan-Romano funk, black truffle adds earthy mushroom aromatics. Indulgent and ingredient-forward."},
    {"name": "Barnana", "url": "https://barnana.com", "description": "Upcycled banana snacks with concentrated tropical sweetness and a chewy, toothsome texture. Natural caramel-like depth from ripened banana sugars, with spiced varieties adding warm cardamom or cinnamon. Simple, fruity, and satisfying."},
]


def fetch_brand_catalog() -> list[dict]:
    response = supabase.table("brands").select("id, name, description, vector, url").execute()
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


def get_user_profile(user_id: str) -> list[dict]:
    response = (
        supabase.table("rankings")
        .select("rank, brands(id, name, description)")
        .eq("user_id", user_id)
        .order("rank")
        .execute()
    )
    return [
        {"rank": row["rank"], **row["brands"]}
        for row in response.data
    ]


def save_rejections(user_id: str, brand_ids: list[str]):
    if not brand_ids:
        return
    rows = [{"user_id": user_id, "brand_id": bid} for bid in brand_ids]
    supabase.table("rejections").upsert(rows, on_conflict="user_id,brand_id").execute()


def get_user_rejection_ids(user_id: str) -> list[str]:
    response = supabase.table("rejections").select("brand_id").eq("user_id", user_id).execute()
    return [row["brand_id"] for row in response.data]


def get_user_rejected_brands(user_id: str) -> list[dict]:
    response = (
        supabase.table("rejections")
        .select("brands(vector)")
        .eq("user_id", user_id)
        .execute()
    )
    return [{"vector": row["brands"]["vector"]} for row in response.data]


def get_user_ranked_brands(user_id: str) -> list[dict]:
    response = (
        supabase.table("rankings")
        .select("rank, brands(vector)")
        .eq("user_id", user_id)
        .execute()
    )
    return [{"rank": row["rank"], "vector": row["brands"]["vector"]} for row in response.data]
