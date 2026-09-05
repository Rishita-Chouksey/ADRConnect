from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.auth import router as auth_router
from src.api.reports import router as reports_router
from src.api.batches import router as batches_router
from src.api.alerts import router as alerts_router

# 1. Initialize FastAPI Application Instance
app = FastAPI(
    title="ADRConnect - Pharmacovigilance (PvPI) System",
    description="Role-based ADR reporting backend with batch tracking and alerts",
    version="1.0.0"
)

# 2. CORS Middleware Configuration
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://10.0.2.2:8000",  # Android Emulator access
    "*"                      # Local development wildcard
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register Routers
app.include_router(auth_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(batches_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")

# 4. Health & Status Endpoints
@app.get("/", tags=["System"])
async def root():
    return {
        "status": "online",
        "system": "ADRConnect Backend Service",
        "version": "1.0.0"
    }

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy"}