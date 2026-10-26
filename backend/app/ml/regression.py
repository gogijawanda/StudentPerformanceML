"""
Regression model training, evaluation, comparison, and persistence.
"""
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

from app.core.config import (
    RANDOM_STATE, TEST_SIZE, TARGET_FEATURE,
    EARLY_FEATURES, GRADE_ASSISTED_FEATURES
)
from app.ml.preprocessing import get_preprocessor


def get_fresh_regressors() -> Dict[str, Any]:
    """Returns freshly initialized regression models to avoid cross-pipeline state pollution."""
    return {
        "Linear Regression": LinearRegression(),
        "Decision Tree Regressor": DecisionTreeRegressor(random_state=RANDOM_STATE, max_depth=6),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE, max_depth=8),
        "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, random_state=RANDOM_STATE, learning_rate=0.08)
    }


def train_and_evaluate_regression(df: pd.DataFrame, mode: str = "early") -> Dict[str, Any]:
    """
    Train and evaluate 4 regression models on identical test split.
    mode: 'early' or 'grade_assisted'
    """
    feature_cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
    X = df[feature_cols].copy()
    y = df[TARGET_FEATURE].copy()
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    models_data = {}
    best_model_name = None
    best_r2 = -float("inf")
    regressors = get_fresh_regressors()

    for name, base_model in regressors.items():
        preprocessor, num_cols, cat_cols = get_preprocessor(mode=mode)
        
        # Build full scikit-learn pipeline
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", base_model)
        ])

        # Fit on train data only!
        pipeline.fit(X_train, y_train)

        # Predictions on train and test
        y_test_pred_raw = pipeline.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, y_test_pred_raw))
        mse = float(mean_squared_error(y_test, y_test_pred_raw))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_test_pred_raw))

        # Check if best
        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name

        # Calculate actual vs predicted pairs & residuals
        predictions_sample = []
        residuals = []
        for actual, pred in zip(y_test.values, y_test_pred_raw):
            res = float(actual - pred)
            residuals.append(res)
            predictions_sample.append({
                "actual": round(float(actual), 2),
                "predicted": round(float(np.clip(pred, 0, 20)), 2),
                "raw_predicted": round(float(pred), 2),
                "residual": round(res, 2)
            })

        # Feature Importance
        feature_importances = []
        try:
            fitted_preprocessor = pipeline.named_steps["preprocessor"]
            cat_encoder = fitted_preprocessor.named_transformers_["cat"].named_steps["encoder"]
            cat_feature_names = cat_encoder.get_feature_names_out(cat_cols).tolist()
            transformed_feature_names = num_cols + cat_feature_names
            
            fitted_regressor = pipeline.named_steps["regressor"]
            if hasattr(fitted_regressor, "feature_importances_"):
                raw_imp = fitted_regressor.feature_importances_
                importance_pairs = sorted(
                    zip(transformed_feature_names, raw_imp),
                    key=lambda x: x[1],
                    reverse=True
                )
                feature_importances = [
                    {"feature": feat, "importance": round(float(val), 4)}
                    for feat, val in importance_pairs[:15]
                ]
            elif hasattr(fitted_regressor, "coef_"):
                raw_coef = np.abs(fitted_regressor.coef_)
                importance_pairs = sorted(
                    zip(transformed_feature_names, raw_coef),
                    key=lambda x: x[1],
                    reverse=True
                )
                feature_importances = [
                    {"feature": feat, "importance": round(float(val), 4)}
                    for feat, val in importance_pairs[:15]
                ]
        except Exception as e:
            feature_importances = []

        models_data[name] = {
            "name": name,
            "pipeline": pipeline,
            "metrics": {
                "mae": round(mae, 4),
                "mse": round(mse, 4),
                "rmse": round(rmse, 4),
                "r2": round(r2, 4)
            },
            "predictions_sample": predictions_sample,
            "feature_importances": feature_importances
        }

    return {
        "mode": mode,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "total_size": len(X),
        "best_model_name": best_model_name,
        "models": models_data
    }

