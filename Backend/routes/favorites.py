from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Favorite
from auth.dependencies import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{anime_id}")
def add_favorite(
    anime_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exists = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.anime_id == anime_id
    ).first()

    if exists:
        raise HTTPException(status_code=400, detail="Already favorited")

    fav = Favorite(
        user_id=user_id,
        anime_id=anime_id,
    )

    db.add(fav)
    db.commit()

    return {"message": "Added to favorites"}

@router.get("")
def get_favorites(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()

@router.delete("/{anime_id}")
def remove_favorite(
    anime_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.anime_id == anime_id
    ).first()

    if not fav:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}
