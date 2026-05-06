from pydantic import BaseModel


class TasteProfileRequest(BaseModel):
    taste_description: str


class BrandOut(BaseModel):
    id: str
    name: str
    description: str
    match_score: float


class DropResponse(BaseModel):
    drop: list[BrandOut]


class RankingItem(BaseModel):
    brand_id: str
    rank: int


class RankingsRequest(BaseModel):
    rankings: list[RankingItem]


class RejectionsRequest(BaseModel):
    brand_ids: list[str]
