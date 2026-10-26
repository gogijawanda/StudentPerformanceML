"""
Unit and integration tests for dataset integrity, leakage prevention, and ML pipelines.
"""
import pytest
import pandas as pd
import numpy as np
from pathlib import Path

from app.core.config import (
    DATASET_PATH, EARLY_FEATURES, GRADE_ASSISTED_FEATURES,
    TARGET_FEATURE, DEFAULT_PASS_THRESHOLD
)
from app.ml.dataset import load_raw_dataset, get_dataset_overview, get_dataset_summary_statistics
from app.ml.preprocessing import get_preprocessor
from app.ml.regression import train_and_evaluate_regression
from app.ml.classification import train_and_evaluate_classification
from app.ml.clustering import perform_student_clustering
from app.ml.pipeline_manager import pipeline_manager


def test_dataset_exists_and_loads():
    """Verify data/student-mat.csv loads with 395 rows and 33 columns using semicolon delimiter."""
    df = load_raw_dataset()
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 395
    assert df.shape[1] == 33
    assert TARGET_FEATURE in df.columns
    assert "school" in df.columns
    assert "age" in df.columns


def test_target_leakage_prevention():
    """Target variable G3 must NEVER be included in feature sets."""
    assert TARGET_FEATURE not in EARLY_FEATURES
    assert TARGET_FEATURE not in GRADE_ASSISTED_FEATURES


def test_early_mode_feature_exclusions():
    """Early prediction mode must strictly exclude G1 and G2."""
    assert "G1" not in EARLY_FEATURES
    assert "G2" not in EARLY_FEATURES
    assert "G1" in GRADE_ASSISTED_FEATURES
    assert "G2" in GRADE_ASSISTED_FEATURES


def test_dataset_overview_metrics():
    """Verify overview calculations are empirical and match raw dataset values."""
    df = load_raw_dataset()
    overview = get_dataset_overview()
    
    assert overview["total_records"] == 395
    assert overview["total_features"] == 33
    assert overview["total_missing"] == 0
    assert overview["mean_final_grade"] == round(float(df[TARGET_FEATURE].mean()), 2)
    assert overview["median_final_grade"] == round(float(df[TARGET_FEATURE].median()), 2)


def test_regression_pipeline_early_and_assisted():
    """Test training and metric calculation across both regression modes."""
    df = load_raw_dataset()
    
    # Early Mode
    res_early = train_and_evaluate_regression(df, mode="early")
    assert res_early["train_size"] == 316
    assert res_early["test_size"] == 79
    assert len(res_early["models"]) == 4
    for name, m in res_early["models"].items():
        assert "mae" in m["metrics"]
        assert "rmse" in m["metrics"]
        assert "r2" in m["metrics"]
        assert m["metrics"]["rmse"] > 0
        
    # Grade-Assisted Mode (should have significantly higher R2)
    res_assisted = train_and_evaluate_regression(df, mode="grade_assisted")
    assert len(res_assisted["models"]) == 4
    best_early_r2 = res_early["models"][res_early["best_model_name"]]["metrics"]["r2"]
    best_assisted_r2 = res_assisted["models"][res_assisted["best_model_name"]]["metrics"]["r2"]
    assert best_assisted_r2 > best_early_r2


def test_classification_pipeline():
    """Test Pass/Fail classification pipeline without data leakage."""
    df = load_raw_dataset()
    clf_res = train_and_evaluate_classification(df, threshold=DEFAULT_PASS_THRESHOLD, mode="early")
    
    assert len(clf_res["models"]) == 3
    for name, m in clf_res["models"].items():
        met = m["metrics"]
        assert 0.0 <= met["accuracy"] <= 1.0
        assert 0.0 <= met["f1_score"] <= 1.0
        assert "confusion_matrix" in met


def test_clustering_kmeans_and_pca():
    """Test clustering execution and 2D PCA projection coordinates."""
    df = load_raw_dataset()
    clusters = perform_student_clustering(df, n_clusters=3)
    
    assert clusters["n_clusters"] == 3
    assert len(clusters["cluster_summaries"]) == 3
    assert len(clusters["data_points"]) == 395
    assert len(clusters["pca_variance_explained"]) == 2
    for p in clusters["data_points"][:5]:
        assert "pca_x" in p
        assert "pca_y" in p
        assert "cluster" in p


def test_single_prediction_and_risk_indicator():
    """Test inference and transparent academic risk indicator."""
    sample_student = {
        "school": "GP", "sex": "F", "age": 16, "address": "U", "famsize": "GT3",
        "Pstatus": "T", "Medu": 3, "Fedu": 3, "Mjob": "other", "Fjob": "other",
        "reason": "home", "guardian": "mother", "traveltime": 1, "studytime": 2,
        "failures": 1, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes",
        "romantic": "no", "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1,
        "Walc": 1, "health": 4, "absences": 4
    }
    
    res = pipeline_manager.predict_single_student(sample_student, mode="early")
    assert 0.0 <= res["predicted_grade"] <= 20.0
    assert res["support_indicator"]["level"] in [
        "High Support Needed", "Moderate Support Needed", "Low Support Needed"
    ]
    assert len(res["influencing_factors"]) > 0

