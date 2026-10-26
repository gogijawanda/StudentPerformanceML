"""
Main FastAPI Application for Smart Academic Intelligence System (SAIS).
"""
import os
import tempfile
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Set temporary directory for Matplotlib cache to prevent Windows permission warnings
os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()
os.environ["LOKY_MAX_CPU_COUNT"] = "4"

from app.core.config import ALLOWED_ORIGINS
from app.ml.pipeline_manager import pipeline_manager
from app.api.routes_overview import router as overview_router
from app.api.routes_dataset import router as dataset_router
from app.api.routes_models import router as models_router
from app.api.routes_predict import router as predict_router
from app.api.routes_analysis import router as analysis_router
from app.api.routes_reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    try:
        pipeline_manager.load_artifacts()
    except Exception as e:
        print(f"Warning: Could not pre-load ML artifacts on startup: {e}")
    yield


app = FastAPI(
    title="Smart Academic Intelligence System (SAIS) API",
    description="Machine Learning-Based Student Performance Prediction, Academic Risk Analysis, and Intelligent Analytics API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An internal server error occurred while processing the academic analytics request.",
            "detail": str(exc)
        }
    )

# Include Routers
app.include_router(overview_router)
app.include_router(dataset_router)
app.include_router(models_router)
app.include_router(predict_router)
app.include_router(analysis_router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "system": "Smart Academic Intelligence System (SAIS)",
        "subtitle": "Machine Learning-Based Student Performance Prediction & Risk Analysis",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_trained": pipeline_manager.are_models_trained(),
        "version": "1.0.0"
    }

