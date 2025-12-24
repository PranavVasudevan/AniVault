from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Journal
from auth.dependencies import get_current_user

router = APIRouter(prefix="/journal", tags=["Journal"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{anime_id}")
def add_journal(
    anime_id: int,
    content: str,
    rating: int | None = None,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Journal(
        user_id=user_id,
        anime_id=anime_id,
        content=content,
        rating=rating,
    )
    db.add(entry)
    db.commit()
    return {"message": "Journal saved"}

@router.get("")
def get_my_journals(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Journal).filter(Journal.user_id == user_id).all()
