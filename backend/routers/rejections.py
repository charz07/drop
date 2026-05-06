from fastapi import APIRouter
from models.schemas import RejectionsRequest
from services.database import save_rejections

router = APIRouter()


@router.post("/")
async def submit_rejections(request: RejectionsRequest, user_id: str):
    save_rejections(user_id, request.brand_ids)
    return {"status": "ok"}
