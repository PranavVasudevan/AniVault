from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from time import time
import random

from app.database import get_db
from app.models import Favorite
from auth.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])

recommend_cache = {}
CACHE_TTL = 1800  # 30 minutes


SIMILAR_POOL = {
    "Action": [
        "Attack on Titan",
        "Demon Slayer",
        "Jujutsu Kaisen",
        "Fullmetal Alchemist Brotherhood",
    ],
    "Slice of Life": [
        "Barakamon",
        "March Comes in Like a Lion",
        "Natsume Yuujinchou",
        "Violet Evergarden",
    ],
    "Drama": [
        "Your Lie in April",
        "Clannad After Story",
        "Anohana",
    ],
    "Fantasy": [
        "Frieren",
        "Made in Abyss",
        "Mushoku Tensei",
    ],
}


@router.get("/recommend")
def recommend_from_favorites(
    db: Session = Depends(get_db),
    user: int = Depends(get_current_user),
):
    now = time()

    #  CACHE HIT
    if user in recommend_cache:
        ts, titles = recommend_cache[user]
        if now - ts < CACHE_TTL:
            return {"titles": titles}

    #  CACHE MISS
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == user)
        .all()
    )

    recommendations = set()

    if favorites:
        for fav in favorites:
            title = fav.anime_title.lower()

            if "slice" in title or "life" in title:
                recommendations.update(SIMILAR_POOL["Slice of Life"])
            elif "action" in title or "attack" in title:
                recommendations.update(SIMILAR_POOL["Action"])
            elif "fantasy" in title:
                recommendations.update(SIMILAR_POOL["Fantasy"])
            else:
                recommendations.update(random.choice(list(SIMILAR_POOL.values())))
    else:
        recommendations.update([
            "Attack on Titan",
            "Steins;Gate",
            "Frieren",
            "Your Name",
            "Death Note",
        ])

    titles = list(recommendations)[:6]

    recommend_cache[user] = (now, titles)
    return {"titles": titles}
