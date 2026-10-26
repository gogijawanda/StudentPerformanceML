"""
Pass/Fail classification model training, evaluation, and inference.
"""
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score
)
from sklearn.pipeline import Pipeline

from app.core.config import (
    RANDOM_STATE, TEST_SIZE, TARGET_FEATURE,
    EARLY_FEATURES, GRADE_ASSISTED_FEATURES, DEFAULT_PASS_THRESHOLD
)
from app.ml.preprocessing import get_preprocessor


def get_fresh_classifiers() -> Dict[str, Any]:
    """Returns freshly initialized classification models to prevent cross-mode state leaks."""
    return {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "Decision Tree Classifier": DecisionTreeClassifier(random_state=RANDOM_STATE, max_depth=5),
        "Random Forest Classifier": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE, max_depth=6)
    }


def train_and_evaluate_classification(
    df: pd.DataFrame,
    threshold: float = DEFAULT_PASS_THRESHOLD,
    mode: str = "early"
) -> Dict[str, Any]:
    """
    Train and evaluate classification models to predict student Pass/Fail outcome.
    threshold: G3 >= threshold is considered 'Pass' (1), else 'Fail' (0).
    """
    feature_cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
    X = df[feature_cols].copy()
    
    y = (df[TARGET_FEATURE] >= threshold).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    models_data = {}
    best_model_name = None
    best_f1 = -float("inf")
    classifiers = get_fresh_classifiers()

    for name, base_model in classifiers.items():
        preprocessor, _, _ = get_preprocessor(mode=mode)
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", base_model)
        ])

        pipeline.fit(X_train, y_train)

        y_test_pred = pipeline.predict(X_test)
        
        roc_auc = None
        if hasattr(pipeline, "predict_proba"):
            try:
                y_proba = pipeline.predict_proba(X_test)[:, 1]
                roc_auc = float(roc_auc_score(y_test, y_proba))
            except Exception:
                roc_auc = None

        acc = float(accuracy_score(y_test, y_test_pred))
        prec = float(precision_score(y_test, y_test_pred, zero_division=0))
        rec = float(recall_score(y_test, y_test_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_test_pred, zero_division=0))
        cm = confusion_matrix(y_test, y_test_pred).tolist()

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

        models_data[name] = {
            "name": name,
            "pipeline": pipeline,
            "metrics": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
                "confusion_matrix": {
                    "tn": cm[0][0] if len(cm) > 1 else cm[0][0],
                    "fp": cm[0][1] if len(cm) > 1 else 0,
                    "fn": cm[1][0] if len(cm) > 1 else 0,
                    "tp": cm[1][1] if len(cm) > 1 else 0
                }
            }
        }

    return {
        "mode": mode,
        "pass_threshold": threshold,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "class_distribution": {
            "pass_count": int(y.sum()),
            "fail_count": int(len(y) - y.sum()),
            "pass_rate_pct": round(float(y.mean() * 100), 1)
        },
        "best_model_name": best_model_name,
        "models": models_data
    }

