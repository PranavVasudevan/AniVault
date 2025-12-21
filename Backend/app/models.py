from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base
from sqlalchemy import ForeignKey

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    anime_id = Column(Integer, index=True)
    anime_title = Column(String)
    anime_image = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    anime_id = Column(Integer, index=True)
    status = Column(String)
class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    anime_id = Column(Integer, index=True)
    content = Column(String)
    rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
