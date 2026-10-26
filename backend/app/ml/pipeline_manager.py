"""
Central ML pipeline manager: handles model training, persistence, caching, and inference.
"""
import os
import joblib
from pathlib import Path
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np

from app.core.config import (
    MODELS_DIR, DATASET_PATH, DEFAULT_PASS_THRESHOLD,
    DEFAULT_HIGH_RISK_THRESHOLD, DEFAULT_MODERATE_RISK_THRESHOLD,
    EARLY_FEATURES, GRADE_ASSISTED_FEATURES
)
from app.ml.dataset import load_raw_dataset
from app.ml.regression import train_and_evaluate_regression
from app.ml.classification import train_and_evaluate_classification
from app.ml.clustering import perform_student_clustering
from app.ml.explainability import compute_permutation_importance


class PipelineManager:
    def __init__(self):
        self.artifacts_path = MODELS_DIR / "sais_artifacts.joblib"
        self._artifacts: Optional[Dict[str, Any]] = None

    def are_models_trained(self) -> bool:
        """Check if serialized model artifacts exist on disk or in memory."""
        if self._artifacts is not None:
            return True
        return self.artifacts_path.exists()

    def load_artifacts(self) -> Dict[str, Any]:
        """Load trained models from memory or disk."""
        if self._artifacts is not None:
            return self._artifacts
        
        if self.artifacts_path.exists():
            self._artifacts = joblib.load(self.artifacts_path)
            return self._artifacts

        # If not trained yet, train now
        return self.train_and_save_all()

    def train_and_save_all(self, pass_threshold: float = DEFAULT_PASS_THRESHOLD) -> Dict[str, Any]:
        """
        Run full training workflow for regression, classification, clustering, and explainability.
        Saves resulting artifacts to disk.
        """
        df = load_raw_dataset()

        # 1. Train Regression (Early & Grade-Assisted)
        reg_early = train_and_evaluate_regression(df, mode="early")
        reg_assisted = train_and_evaluate_regression(df, mode="grade_assisted")

        # 2. Train Classification (Early & Grade-Assisted)
        clf_early = train_and_evaluate_classification(df, threshold=pass_threshold, mode="early")
        clf_assisted = train_and_evaluate_classification(df, threshold=pass_threshold, mode="grade_assisted")

        # 3. Clustering
        clustering_result = perform_student_clustering(df, n_clusters=3)

        # 4. Permutation Importances for Best Regression Models
        best_early_model = reg_early["models"][reg_early["best_model_name"]]["pipeline"]
        best_assisted_model = reg_assisted["models"][reg_assisted["best_model_name"]]["pipeline"]
        
        perm_early = compute_permutation_importance(best_early_model, df, mode="early")
        perm_assisted = compute_permutation_importance(best_assisted_model, df, mode="grade_assisted")

        artifacts = {
            "regression": {
                "early": reg_early,
                "grade_assisted": reg_assisted
            },
            "classification": {
                "early": clf_early,
                "grade_assisted": clf_assisted
            },
            "clustering": clustering_result,
            "permutation_importance": {
                "early": perm_early,
                "grade_assisted": perm_assisted
            },
            "dataset_info": {
                "total_rows": len(df),
                "total_features": df.shape[1],
                "pass_threshold": pass_threshold
            }
        }

        # Save to disk
        joblib.dump(artifacts, self.artifacts_path)
        self._artifacts = artifacts
        return artifacts

    def get_regression_metrics(self) -> Dict[str, Any]:
        """Retrieve stored regression comparison metrics."""
        artifacts = self.load_artifacts()
        reg = artifacts["regression"]

        summary = {}
        for mode in ["early", "grade_assisted"]:
            mode_data = reg[mode]
            model_cards = []
            for name, m_info in mode_data["models"].items():
                model_cards.append({
                    "name": name,
                    "metrics": m_info["metrics"],
                    "is_best": (name == mode_data["best_model_name"]),
                    "feature_importances": m_info["feature_importances"]
                })
            summary[mode] = {
                "mode": mode,
                "best_model_name": mode_data["best_model_name"],
                "train_size": mode_data["train_size"],
                "test_size": mode_data["test_size"],
                "models": model_cards
            }
        return summary

    def get_classification_metrics(self) -> Dict[str, Any]:
        """Retrieve stored classification metrics."""
        artifacts = self.load_artifacts()
        clf = artifacts["classification"]
        
        summary = {}
        for mode in ["early", "grade_assisted"]:
            mode_data = clf[mode]
            model_cards = []
            for name, m_info in mode_data["models"].items():
                model_cards.append({
                    "name": name,
                    "metrics": m_info["metrics"],
                    "is_best": (name == mode_data["best_model_name"])
                })
            summary[mode] = {
                "mode": mode,
                "best_model_name": mode_data["best_model_name"],
                "pass_threshold": mode_data["pass_threshold"],
                "class_distribution": mode_data["class_distribution"],
                "models": model_cards
            }
        return summary

    def predict_single_student(
        self,
        student_data: Dict[str, Any],
        mode: str = "early",
        model_name: Optional[str] = None,
        high_risk_threshold: float = DEFAULT_HIGH_RISK_THRESHOLD,
        moderate_risk_threshold: float = DEFAULT_MODERATE_RISK_THRESHOLD
    ) -> Dict[str, Any]:
        """
        Predict final grade G3 (0-20) and compute academic support indicator.
        """
        artifacts = self.load_artifacts()
        reg_mode = artifacts["regression"][mode]
        
        selected_model_name = model_name or reg_mode["best_model_name"]
        if selected_model_name not in reg_mode["models"]:
            selected_model_name = reg_mode["best_model_name"]

        pipeline = reg_mode["models"][selected_model_name]["pipeline"]
        metrics = reg_mode["models"][selected_model_name]["metrics"]

        # Prepare single row DataFrame
        expected_cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
        row_dict = {col: [student_data.get(col)] for col in expected_cols}
        df_row = pd.DataFrame(row_dict)

        # Predict
        raw_pred = float(pipeline.predict(df_row)[0])
        clipped_pred = round(float(np.clip(raw_pred, 0.0, 20.0)), 2)

        # Assess academic risk indicator based on transparent rules
        if clipped_pred < high_risk_threshold:
            support_level = "High Support Needed"
            support_badge = "critical"
            rule_explanation = f"Predicted final score ({clipped_pred}/20) falls below the passing threshold of {high_risk_threshold}."
        elif clipped_pred < moderate_risk_threshold:
            support_level = "Moderate Support Needed"
            support_badge = "warning"
            rule_explanation = f"Predicted score ({clipped_pred}/20) meets passing standards but falls below {moderate_risk_threshold}, indicating opportunity for targeted reinforcement."
        else:
            support_level = "Low Support Needed"
            support_badge = "safe"
            rule_explanation = f"Predicted score ({clipped_pred}/20) is {moderate_risk_threshold} or above, indicating consistent academic trajectory."

        # Key student contributory factors
        influencing_factors = []
        if int(student_data.get("failures", 0)) > 0:
            influencing_factors.append(f"Recorded past class failures: {student_data.get('failures')}")
        if int(student_data.get("absences", 0)) > 10:
            influencing_factors.append(f"High recorded absences: {student_data.get('absences')} classes missed")
        elif int(student_data.get("absences", 0)) <= 3:
            influencing_factors.append("Excellent attendance record (≤ 3 absences)")
        if int(student_data.get("studytime", 2)) >= 3:
            influencing_factors.append("Substantial weekly study investment (≥ 5 hours/week)")
        elif int(student_data.get("studytime", 2)) == 1:
            influencing_factors.append("Low weekly study time reported (< 2 hours/week)")
        if student_data.get("higher") == "yes":
            influencing_factors.append("Expressed aspiration for higher education")
        if mode == "grade_assisted":
            g1 = student_data.get("G1")
            g2 = student_data.get("G2")
            if g1 is not None and g2 is not None:
                influencing_factors.append(f"Prior term exam benchmarks: G1={g1}, G2={g2}")

        return {
            "mode": mode,
            "model_used": selected_model_name,
            "model_test_metrics": metrics,
            "predicted_grade": clipped_pred,
            "raw_grade": round(raw_pred, 2),
            "scale": "0 to 20",
            "support_indicator": {
                "level": support_level,
                "badge": support_badge,
                "rule_explanation": rule_explanation,
                "thresholds": {
                    "high_risk_below": high_risk_threshold,
                    "moderate_risk_below": moderate_risk_threshold
                }
            },
            "influencing_factors": influencing_factors,
            "disclaimer": "This prediction is an empirical estimate derived from statistical machine learning patterns. It serves as an advisory tool and does not dictate future performance."
        }


# Global singleton instance
pipeline_manager = PipelineManager()

