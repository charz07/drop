from fastapi import APIRouter
from services.database import get_user_profile
from services.rationale import generate_taste_summary

router = APIRouter()


@router.get("/")
async def user_profile(user_id: str):
    brands = get_user_profile(user_id)
    summary = None
    if brands:
        top_brands = [b for b in brands if b["rank"] <= 2]
        if not top_brands:
            top_brands = brands[:2]
        summary = await generate_taste_summary(top_brands)
    return {"brands": brands, "summary": summary}
