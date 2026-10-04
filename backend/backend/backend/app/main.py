from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router


app = FastAPI(
    title="School Management System API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
HOMEWORK_UPLOAD_DIR = UPLOAD_DIR / "homework"

HOMEWORK_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "School Management System API is running"
    }