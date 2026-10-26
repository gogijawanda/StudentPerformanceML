"""
Student segmentation, clustering, and model explainability endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from app.ml.pipeline_manager import pipeline_manager
from app.ml.dataset import load_raw_dataset
from app.ml.clustering import perform_student_clustering

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


@router.get("/segmentation")
def get_segmentation(n_clusters: int = Query(3, ge=2, le=6, description="Number of student clusters")):
    """
    K-Means clustering and PCA 2D projections.
    """
    try:
        df = load_raw_dataset()
        result = perform_student_clustering(df, n_clusters=n_clusters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering analysis failed: {str(e)}")


@router.get("/explainability")
def get_explainability(mode: str = Query("early", description="'early' or 'grade_assisted'")):
    """
    Feature importance, permutation importance, and actual-vs-predicted residual diagnostics.
    """
    try:
        artifacts = pipeline_manager.load_artifacts()
        reg_mode = artifacts["regression"][mode]
        best_model_name = reg_mode["best_model_name"]
        best_model_info = reg_mode["models"][best_model_name]

        perm_imp = artifacts.get("permutation_importance", {}).get(mode, [])

        return {
            "mode": mode,
            "best_model_name": best_model_name,
            "feature_importances": best_model_info["feature_importances"],
            "permutation_importance": perm_imp,
            "predictions_sample": best_model_info["predictions_sample"],
            "methodology_note": "Feature importance denotes statistical predictive contribution within this dataset and should not be confused with causal effect."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explainability analysis failed: {str(e)}")

