import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import init_db
from routes.audio import router as audio_router
from routes.posts import router as posts_router
from routes.auth import router as auth_router

UPLOAD_DIR = Path(__file__).parent / "uploads" / "audio"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

IMAGES_DIR = Path(__file__).parent / "uploads" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Static frontend directory (copied into Docker image in production)
FRONTEND_DIR = Path(__file__).parent / "frontend-dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="小世界 · A Little World", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(audio_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.mount("/uploads/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")


@app.get("/api/health")
def health():
    return {"status": "ok", "db": "connected"}


# Serve frontend static files in production
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    # Catch-all: serve index.html for SPA client-side routing
    @app.get("/{rest:path}")
    async def spa_fallback(rest: str):
        file_path = FRONTEND_DIR / rest
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")

    # Root
    @app.get("/")
    async def root():
        return FileResponse(FRONTEND_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", "8765"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
