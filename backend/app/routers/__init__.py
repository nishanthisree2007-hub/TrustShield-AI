from app.routers.auth import router as auth_router
from app.routers.brands import router as brands_router
from app.routers.profiles import router as profiles_router
from app.routers.scams import router as scams_router
from app.routers.apps import router as apps_router
from app.routers.investigations import router as investigations_router
from app.routers.graph import router as graph_router
from app.routers.clustering import router as clustering_router
from app.routers.twin import router as twin_router
from app.routers.vault import router as vault_router
from app.routers.copilot import router as copilot_router
from app.routers.lab import router as lab_router
from app.routers.dashboard import router as dashboard_router
from app.routers.export import router as export_router

__all__ = [
    "auth_router",
    "brands_router",
    "profiles_router",
    "scams_router",
    "apps_router",
    "investigations_router",
    "graph_router",
    "clustering_router",
    "twin_router",
    "vault_router",
    "copilot_router",
    "lab_router",
    "dashboard_router",
    "export_router"
]
