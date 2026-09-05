from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings
from src.api.auth import router as auth_router

app = FastAPI(
    title="ADRConnect API",
    description="Backend API services for ADR reporting, batch traceability, and alerts",
    version="1.0.0"
)

# Enable CORS for Flutter Client / Web Frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(auth_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "ADRConnect Backend Service",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}