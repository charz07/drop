from fastapi import APIRouter, HTTPException
from models.schemas import TasteProfileRequest, DropResponse, BrandOut
from services.embeddings import embed_text
from services.matching import generate_drop
from services.database import fetch_brand_catalog, get_drop_history, save_drop_history, ensure_user_exists

router = APIRouter()


@router.post("/", response_model=DropResponse)
async def get_recommendations(request: TasteProfileRequest, user_id: str):
    ensure_user_exists(user_id)
    brand_catalog = fetch_brand_catalog()

    if not brand_catalog:
        raise HTTPException(status_code=503, detail="Brand catalog not available")

    user_vector = embed_text(request.taste_description)
    already_received = get_drop_history(user_id)
    drop = generate_drop(user_vector, brand_catalog, already_received)
    save_drop_history(user_id, [brand["id"] for brand in drop])

    return DropResponse(drop=[BrandOut(**brand) for brand in drop])
