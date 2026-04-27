from fastapi import APIRouter, HTTPException
from models.schemas import TasteProfileRequest, DropResponse, BrandOut
from services.embeddings import embed_text
from services.matching import generate_drop, build_preference_vector, blend_vectors
from services.database import fetch_brand_catalog, get_drop_history, save_drop_history, ensure_user_exists, get_user_ranked_brands

router = APIRouter()


@router.post("/", response_model=DropResponse)
async def get_recommendations(request: TasteProfileRequest, user_id: str):
    ensure_user_exists(user_id)
    brand_catalog = fetch_brand_catalog()

    if not brand_catalog:
        raise HTTPException(status_code=503, detail="Brand catalog not available")

    user_vector = embed_text(request.taste_description)

    ranked_brands = get_user_ranked_brands(user_id)
    if ranked_brands:
        pref_vec = build_preference_vector(ranked_brands)
        user_vector = blend_vectors(user_vector, pref_vec)

    already_received = get_drop_history(user_id)
    drop = generate_drop(user_vector, brand_catalog, already_received)
    save_drop_history(user_id, [brand["id"] for brand in drop])

    return DropResponse(drop=[BrandOut(**brand) for brand in drop])
