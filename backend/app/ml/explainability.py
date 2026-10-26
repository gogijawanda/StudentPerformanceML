"""
Model explainability: feature importance, permutation importance, and residual diagnostics.
"""
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

from app.core.config import (
    RANDOM_STATE, TEST_SIZE, TARGET_FEATURE,
    EARLY_FEATURES, GRADE_ASSISTED_FEATURES
)


def compute_permutation_importance(pipeline, df: pd.DataFrame, mode: str = "early", n_repeats: int = 5) -> List[Dict[str, Any]]:
    """
    Computes permutation importance on the held-out test split.
    Permutation importance measures drop in model score when a feature column is randomly shuffled.
    """
    feature_cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
    X = df[feature_cols].copy()
    y = df[TARGET_FEATURE].copy()

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    try:
        result = permutation_importance(
            pipeline, X_test, y_test,
            n_repeats=n_repeats,
            random_state=RANDOM_STATE,
            scoring="neg_mean_absolute_error"
        )
        
        # Rank by mean importance
        importances = []
        for i, col in enumerate(feature_cols):
            mean_score = float(result.importances_mean[i])
            std_score = float(result.importances_std[i])
            importances.append({
                "feature": col,
                "importance_mean": round(max(0.0, mean_score), 4),
                "importance_std": round(std_score, 4)
            })

        importances.sort(key=lambda x: x["importance_mean"], reverse=True)
        return importances[:12]
    except Exception as e:
        return []

