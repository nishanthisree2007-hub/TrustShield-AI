from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.data_seeder import seed_demo_data
from app.routers import (
    auth_router,
    brands_router,
    profiles_router,
    scams_router,
    apps_router,
    investigations_router,
    graph_router,
    clustering_router,
    twin_router,
    vault_router,
    copilot_router,
    lab_router,
    dashboard_router,
    export_router
)

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

# Seed Initial Realistic Demo Data
try:
    with SessionLocal() as db:
        seed_demo_data(db)
except Exception as e:
    logging.warning(f"Database seeder notice: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        f"**{settings.TAGLINE}**\n\n"
        "AI-Assisted Digital Risk Protection Platform built for the Kampus.vc Hackathon. "
        "Provides Brand DNA Fingerprinting, Impersonation Radar, Scam DNA Analyzer (English & Tamil), "
        "Threat Relationship Graph (Cytoscape.js), Mobile App Inspector, Explainable Risk Engine, "
        "AI Investigation Copilot, Scam Campaign Clustering, Brand Risk Digital Twin, "
        "Evidence Vault, and Detection Quality Lab."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": settings.TAGLINE,
        "environment": settings.APP_ENV
    }

# Register Feature Routers
app.include_router(auth_router)
app.include_router(brands_router)
app.include_router(profiles_router)
app.include_router(scams_router)
app.include_router(apps_router)
app.include_router(investigations_router)
app.include_router(graph_router)
app.include_router(clustering_router)
app.include_router(twin_router)
app.include_router(vault_router)
app.include_router(copilot_router)
app.include_router(lab_router)
app.include_router(dashboard_router)
app.include_router(export_router)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred in TrustShield AI engine."}
    )

# Unified Single-Port Hosting: Serve Frontend SPA from FastAPI if built
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith(("api", "docs", "redoc", "openapi.json", "health")):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
