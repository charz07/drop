from fastapi import APIRouter
from services.database import reset_drop_history

router = APIRouter()


@router.delete("/reset-history")
async def reset_history(user_id: str):
    reset_drop_history(user_id)
    return {"status": "ok"}
