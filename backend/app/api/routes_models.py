"""
Model training, evaluation metrics, and comparison endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from app.ml.pipeline_manager import pipeline_manager
from app.core.config import DEFAULT_PASS_THRESHOLD

router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("/metrics")
def get_regression_metrics():
    """
    Returns comparative metrics for all 4 regression algorithms across both Early and Grade-Assisted modes.
    Includes actual vs predicted chart samples.
    """
    try:
        artifacts = pipeline_manager.load_artifacts()
        reg = artifacts["regression"]
        
        response = {}
        for mode in ["early", "grade_assisted"]:
            mode_data = reg[mode]
            model_list = []
            for name, m_info in mode_data["models"].items():
                model_list.append({
                    "name": name,
                    "metrics": m_info["metrics"],
                    "is_best": (name == mode_data["best_model_name"]),
                    "feature_importances": m_info["feature_importances"],
                    "predictions_sample": m_info["predictions_sample"]
                })
            response[mode] = {
                "mode": mode,
                "best_model_name": mode_data["best_model_name"],
                "train_size": mode_data["train_size"],
                "test_size": mode_data["test_size"],
                "models": model_list
            }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model metrics: {str(e)}")


@router.get("/classification-metrics")
def get_classification_metrics():
    """
    Returns comparative metrics for all 3 classification algorithms across both Early and Grade-Assisted modes.
    """
    try:
        return pipeline_manager.get_classification_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load classification metrics: {str(e)}")


@router.post("/train")
def train_models(pass_threshold: float = Query(DEFAULT_PASS_THRESHOLD, ge=0.0, le=20.0)):
    """
    Trigger full model re-training and re-evaluation.
    Updates persisted joblib artifacts.
    """
    try:
        artifacts = pipeline_manager.train_and_save_all(pass_threshold=pass_threshold)
        return {
            "status": "success",
            "message": "Models retrained and serialized successfully.",
            "best_early_regressor": artifacts["regression"]["early"]["best_model_name"],
            "best_assisted_regressor": artifacts["regression"]["grade_assisted"]["best_model_name"],
            "best_early_classifier": artifacts["classification"]["early"]["best_model_name"],
            "best_assisted_classifier": artifacts["classification"]["grade_assisted"]["best_model_name"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

