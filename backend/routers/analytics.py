from fastapi import APIRouter
from services.database import record_click

router = APIRouter()


@router.post("/click")
async def track_click(user_id: str, brand_id: str):
    record_click(user_id, brand_id)
    return {"status": "ok"}
