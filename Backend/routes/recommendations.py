from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import httpx

from app.database import get_db
from app.models import Favorite
from auth.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])

JIKAN = "https://api.jikan.moe/v4/anime"


@router.get("/recommend")
async def recommend(
    db: Session = Depends(get_db),
    user: int = Depends(get_current_user),
    type: str = Query("tv"),          # tv | movie
    genre: int | None = Query(None),  # MAL genre id
):
    favorites = db.query(Favorite).filter(Favorite.user_id == user).all()

    seeds = []
    for f in favorites[:3]:
        seeds.append(f.anime_title)

    params = {
        "order_by": "score",
        "sort": "desc",
        "limit": 25,
        "type": type,
        "sfw": "true",
    }

    if genre:
        params["genres"] = genre

    async with httpx.AsyncClient(timeout=12) as client:
        res = await client.get(JIKAN, params=params)
        data = res.json().get("data", [])

    return data[:30]
