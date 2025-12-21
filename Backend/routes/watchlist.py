from fastapi import APIRouter, Depends
from pydantic import BaseModel
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

class WatchRequest(BaseModel):
    anime_id: int
    status: str

@router.post("")
def set_watchlist(
    data: WatchRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.anime_id == data.anime_id
    ).first()

    if entry:
        entry.status = data.status
    else:
        entry = Watchlist(
            user_id=user_id,
            anime_id=data.anime_id,
            status=data.status
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
