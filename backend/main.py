import sys
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from routes import analysis_router, history_router, dashboard_router, auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Ergonomic Monitoring System",
    description="Real-time ergonomic posture and eye blink analysis backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(history_router)
app.include_router(dashboard_router)

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ergonomic-monitoring-system",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
