from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import settings
from core.middleware import MaintenanceMiddleware
from api.v1.api import api_router
from contextlib import asynccontextmanager
from db.session import SessionLocal
from db.seed_settings import seed_default_settings
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed Database Settings
    async with SessionLocal() as db:
        await seed_default_settings(db)
    yield
    # Shutdown


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # Add maintenance middleware FIRST so it executes AFTER CORSMiddleware
    app.add_middleware(MaintenanceMiddleware)

    # Set all CORS enabled origins
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[
                "http://localhost:3000", 
                "http://localhost:3001", 
                "http://127.0.0.1:3000", 
                "http://127.0.0.1:3001",
                "http://192.168.1.4:3000"
            ],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Include main API router
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    os.makedirs("static/uploads", exist_ok=True)
    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.get("/")
    def root():
        return {"message": "Welcome to Bull Wave Gaming Admin Panel API"}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
