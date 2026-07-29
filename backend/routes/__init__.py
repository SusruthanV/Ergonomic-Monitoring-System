from .analysis import router as analysis_router
from .history import router as history_router
from .dashboard import router as dashboard_router
from .auth import router as auth_router

__all__ = [
    "analysis_router",
    "history_router",
    "dashboard_router",
    "auth_router",
]
