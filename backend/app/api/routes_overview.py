"""
Overview dashboard API endpoints.
"""
from fastapi import APIRouter
from app.ml.dataset import get_dataset_overview
from app.ml.pipeline_manager import pipeline_manager

router = APIRouter(prefix="/api/overview", tags=["Overview"])

@router.get("")
def get_overview_data():
    """
    Returns real loaded dataset metrics and active model training status.
    No fabricated data.
    """
    dataset_stats = get_dataset_overview()
    is_trained = pipeline_manager.are_models_trained()
    
    regression_summary = None
    if is_trained:
        try:
            regression_summary = pipeline_manager.get_regression_metrics()
        except Exception:
            regression_summary = None

    return {
        "status": "success",
        "dataset": dataset_stats,
        "models_trained": is_trained,
        "models_summary": regression_summary
    }

