"""
Offline model training and evaluation script.
Usage:
    python backend/train.py
"""
import os
import sys
from pathlib import Path

# Fix Windows joblib warning & encoding
os.environ["LOKY_MAX_CPU_COUNT"] = "4"
os.environ["PYTHONIOENCODING"] = "utf-8"

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_path))

from app.ml.pipeline_manager import pipeline_manager
from app.ml.dataset import load_raw_dataset

def main():
    print("=" * 60)
    print("SMART ACADEMIC INTELLIGENCE SYSTEM (SAIS) - MODEL TRAINING")
    print("=" * 60)
    
    print("1. Loading dataset...")
    df = load_raw_dataset()
    print(f"   Loaded {len(df)} records, {df.shape[1]} features.")
    
    print("\n2. Training Regression, Classification, and Clustering pipelines...")
    artifacts = pipeline_manager.train_and_save_all()
    
    print("\n3. Regression Results (Held-out 20% Test Split):")
    for mode in ["early", "grade_assisted"]:
        print(f"\n   >>> Mode: {mode.upper()}")
        best = artifacts["regression"][mode]["best_model_name"]
        print(f"   Best Model: {best}")
        for name, m in artifacts["regression"][mode]["models"].items():
            met = m["metrics"]
            star = "[BEST]" if name == best else "      "
            print(f"   {star} {name:<28} | MAE: {met['mae']:<6.3f} | RMSE: {met['rmse']:<6.3f} | R^2: {met['r2']:<6.3f}")

    print("\n4. Classification Results (Pass/Fail):")
    for mode in ["early", "grade_assisted"]:
        print(f"\n   >>> Mode: {mode.upper()}")
        best = artifacts["classification"][mode]["best_model_name"]
        print(f"   Best Model: {best}")
        for name, m in artifacts["classification"][mode]["models"].items():
            met = m["metrics"]
            star = "[BEST]" if name == best else "      "
            roc_str = f"{met['roc_auc']:.3f}" if met.get('roc_auc') is not None else "N/A"
            print(f"   {star} {name:<28} | Acc: {met['accuracy']*100:<5.1f}% | F1: {met['f1_score']:<5.3f} | ROC-AUC: {roc_str}")

    print("\n5. Clustering Results:")
    c = artifacts["clustering"]
    print(f"   Formed {c['n_clusters']} student segments.")
    for s in c["cluster_summaries"]:
        print(f"   - {s['label']}: {s['student_count']} students ({s['percentage']}%)")

    print("\n" + "=" * 60)
    print(f"SUCCESS: Artifacts saved to {pipeline_manager.artifacts_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()

