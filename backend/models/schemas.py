from pydantic import BaseModel


class TasteProfileRequest(BaseModel):
    taste_description: str


class BrandOut(BaseModel):
    id: str
    name: str
    description: str
    match_score: float
    url: str | None = None
    image_url: str | None = None
    tags: list[str] = []


class DropResponse(BaseModel):
    drop: list[BrandOut]


class RankingItem(BaseModel):
    brand_id: str
    rank: int


class RankingsRequest(BaseModel):
    rankings: list[RankingItem]


class RejectionsRequest(BaseModel):
    brand_ids: list[str]
