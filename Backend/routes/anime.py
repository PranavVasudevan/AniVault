from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/anime", tags=["Anime"])

JIKAN_URL = "https://api.jikan.moe/v4/anime"


# HOME / GENRE ENDPOINT

@router.get("")
async def get_anime(
    page: int = 1,
    genre: int | None = None,
):
    params = {
        "page": page,
        "limit": 25,
        "sfw": "true",
        "order_by": "score",
        "sort": "desc",
    }

    if genre:
        params["genres"] = genre

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(JIKAN_URL, params=params)
            data = res.json()
        return data.get("data", [])
    except Exception as e:
        print(" Home error:", e)
        return []


# SEARCH ENDPOINT

@router.get("/search")
async def search_anime(q: str, page: int = 1):
    params = {
        "q": q,
        "page": page,
        "limit": 25,
        "sfw": "true",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(JIKAN_URL, params=params)
            data = res.json()
        return data.get("data", [])
    except Exception as e:
        print(" Search error:", e)
        return []

