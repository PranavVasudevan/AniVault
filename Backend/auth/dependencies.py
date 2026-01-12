from fastapi import Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from auth.auth_utils import decode_token

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request):
    raw = request.headers.get("authorization")

    if not raw:
        raise HTTPException(status_code=401, detail="Missing auth header")

    token = raw.replace("Bearer ", "")
    payload = decode_token(token)

    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload["user_id"]
