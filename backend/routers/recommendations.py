from fastapi import APIRouter, HTTPException, Request
from models.schemas import TasteProfileRequest, DropResponse, BrandOut
from services.embeddings import embed_text
from services.matching import generate_drop, build_preference_vector, blend_vectors
from services.database import fetch_brand_catalog, get_drop_history, save_drop_history, ensure_user_exists, get_user_ranked_brands, get_user_rejected_brands, get_user_rejection_ids
from main import limiter

router = APIRouter()


@router.post("/", response_model=DropResponse)
@limiter.limit("10/minute")
async def get_recommendations(request: Request, body: TasteProfileRequest, user_id: str):
    ensure_user_exists(user_id)
    brand_catalog = fetch_brand_catalog()

    if not brand_catalog:
        raise HTTPException(status_code=503, detail="Brand catalog not available")

    user_vector = embed_text(body.taste_description)

    ranked_brands = get_user_ranked_brands(user_id)
    rejected_brands = get_user_rejected_brands(user_id)
    if ranked_brands or rejected_brands:
        pref_vec = build_preference_vector(ranked_brands, rejected_brands)
        if pref_vec:
            user_vector = blend_vectors(user_vector, pref_vec)

    already_received = get_drop_history(user_id)
    rejected_ids = get_user_rejection_ids(user_id)
    drop = generate_drop(user_vector, brand_catalog, already_received, rejected_ids, ranked_brands=ranked_brands)
    save_drop_history(user_id, [brand["id"] for brand in drop])

    return DropResponse(drop=[BrandOut(**brand) for brand in drop])
