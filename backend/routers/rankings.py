from fastapi import APIRouter
from models.schemas import RankingsRequest
from services.database import save_rankings

router = APIRouter()


@router.post("/")
async def submit_rankings(request: RankingsRequest, user_id: str):
    save_rankings(user_id, [r.model_dump() for r in request.rankings])
    return {"status": "ok"}
