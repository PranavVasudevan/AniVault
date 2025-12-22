from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.anime import router as anime_router
from routes.favorites import router as favorites_router
from routes.watchlist import router as watchlist_router
from routes.journal import router as journal_router
from auth.auth_routes import router as auth_router
from routes.recommendations import router as ai_router

from app.database import engine, Base
from app import models

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ani-vault-awoe.vercel.app",
        "https://ani-vault-srp9.vercel.app",
        "https://ani-vault-p.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(anime_router)
app.include_router(favorites_router)
app.include_router(watchlist_router)
app.include_router(journal_router)
app.include_router(ai_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "ok"}
