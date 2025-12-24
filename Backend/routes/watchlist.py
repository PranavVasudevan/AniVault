from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Watchlist
from auth.dependencies import get_current_user

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{anime_id}")
def set_watchlist(
    anime_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.anime_id == anime_id
    ).first()

    if entry:
        entry.status = "watching"
    else:
        entry = Watchlist(
            user_id=user_id,
            anime_id=anime_id,
            status="watching"
        )
        db.add(entry)

    db.commit()
    return {"message": "Updated"}

@router.get("")
def get_watchlist(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Watchlist).filter(Watchlist.user_id == user_id).all()
