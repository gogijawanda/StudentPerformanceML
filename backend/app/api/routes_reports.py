"""
Report generation and export endpoints.
"""
import io
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, HTMLResponse
from app.ml.pipeline_manager import pipeline_manager
from app.ml.dataset import get_dataset_overview

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/model-comparison")
def export_model_comparison_csv():
    """
    Export all regression and classification evaluation metrics as a downloadable CSV.
    """
    try:
        artifacts = pipeline_manager.load_artifacts()
        rows = []
        
        # Regression
        for mode in ["early", "grade_assisted"]:
            for name, data in artifacts["regression"][mode]["models"].items():
                m = data["metrics"]
                rows.append({
                    "Task": "Regression",
                    "Mode": mode,
                    "Algorithm": name,
                    "MAE": m["mae"],
                    "MSE": m["mse"],
                    "RMSE": m["rmse"],
                    "R2_Score": m["r2"],
                    "Accuracy": None,
                    "F1_Score": None
                })

        # Classification
        for mode in ["early", "grade_assisted"]:
            for name, data in artifacts["classification"][mode]["models"].items():
                m = data["metrics"]
                rows.append({
                    "Task": "Classification",
                    "Mode": mode,
                    "Algorithm": name,
                    "MAE": None,
                    "MSE": None,
                    "RMSE": None,
                    "R2_Score": None,
                    "Accuracy": m["accuracy"],
                    "F1_Score": m["f1_score"]
                })

        df = pd.DataFrame(rows)
        stream = io.StringIO()
        df.to_csv(stream, index=False)

        return Response(
            content=stream.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=sais_model_comparison.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate comparison CSV: {str(e)}")


@router.get("/summary-report")
def export_html_summary_report():
    """
    Generate a complete, printable HTML analytical report containing verified figures.
    """
    try:
        overview = get_dataset_overview()
        reg_metrics = pipeline_manager.get_regression_metrics()
        clf_metrics = pipeline_manager.get_classification_metrics()
        
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SAIS Academic Intelligence Analytical Report</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }}
        h1 {{ color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }}
        h2 {{ color: #1e293b; margin-top: 28px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }}
        .badge {{ background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
        th, td {{ border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }}
        th {{ background-color: #f8fafc; font-weight: 600; }}
        .metric-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; }}
        .metric-val {{ font-size: 24px; font-weight: bold; color: #0f172a; }}
        .metric-lbl {{ font-size: 12px; color: #64748b; text-transform: uppercase; }}
        .disclaimer {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 30px; font-size: 14px; color: #92400e; }}
    </style>
</head>
<body>
    <h1>Smart Academic Intelligence System (SAIS)</h1>
    <p><strong>System Evaluation and Analytical Technical Report</strong> | MCA Project Demonstration</p>
    
    <h2>1. Dataset Executive Summary</h2>
    <div class="metric-box">
        <div><div class="metric-val">{overview['total_records']}</div><div class="metric-lbl">Total Students</div></div>
        <div><div class="metric-val">{overview['total_features']}</div><div class="metric-lbl">Features</div></div>
        <div><div class="metric-val">{overview['mean_final_grade']}/20</div><div class="metric-lbl">Mean Final Grade (G3)</div></div>
        <div><div class="metric-val">{overview['median_final_grade']}/20</div><div class="metric-lbl">Median Final Grade</div></div>
    </div>

    <h2>2. Machine Learning Regression Benchmarks</h2>
    <p><strong>Evaluation Protocol:</strong> 80/20 train/test split (fixed random seed = 42). Metrics measured on held-out test data.</p>
    
    <h3>Mode 1: Early Prediction (Excluding Exam Period Grades G1 and G2)</h3>
    <table>
        <tr><th>Algorithm</th><th>MAE</th><th>RMSE</th><th>R² Score</th></tr>
        {"".join([f"<tr><td>{m['name']}{' <strong>(Best)</strong>' if m['is_best'] else ''}</td><td>{m['metrics']['mae']}</td><td>{m['metrics']['rmse']}</td><td>{m['metrics']['r2']}</td></tr>" for m in reg_metrics['early']['models']])}
    </table>

    <h3>Mode 2: Grade-Assisted Prediction (Including G1 and G2)</h3>
    <table>
        <tr><th>Algorithm</th><th>MAE</th><th>RMSE</th><th>R² Score</th></tr>
        {"".join([f"<tr><td>{m['name']}{' <strong>(Best)</strong>' if m['is_best'] else ''}</td><td>{m['metrics']['mae']}</td><td>{m['metrics']['rmse']}</td><td>{m['metrics']['r2']}</td></tr>" for m in reg_metrics['grade_assisted']['models']])}
    </table>

    <h2>3. Classification Benchmarks (Pass/Fail at Threshold G3 &ge; 10)</h2>
    <table>
        <tr><th>Mode</th><th>Algorithm</th><th>Accuracy</th><th>F1-Score</th></tr>
        {"".join([f"<tr><td>Early</td><td>{m['name']}</td><td>{round(m['metrics']['accuracy']*100, 1)}%</td><td>{m['metrics']['f1_score']}</td></tr>" for m in clf_metrics['early']['models']])}
        {"".join([f"<tr><td>Grade-Assisted</td><td>{m['name']}</td><td>{round(m['metrics']['accuracy']*100, 1)}%</td><td>{m['metrics']['f1_score']}</td></tr>" for m in clf_metrics['grade_assisted']['models']])}
    </table>

    <h2>4. Ethical Considerations and Algorithmic Limitations</h2>
    <ul>
        <li><strong>Advisory Nature:</strong> Machine learning forecasts are probability estimates based on historical statistical correlations, not deterministic judgments of human intelligence.</li>
        <li><strong>No Causal Claim:</strong> Predictive feature importance does not establish causality. For example, school absences correlate with lower grades, but absences may stem from underlying health or transportation constraints.</li>
        <li><strong>Early Mode vs. Grade-Assisted Variance:</strong> Early behavioral predictions naturally carry lower R² (~0.28) than grade-assisted predictions (~0.81), illustrating that interim academic testing remains the strongest numerical grade predictor.</li>
    </ul>

    <div class="disclaimer">
        <strong>Notice:</strong> Generated automatically by the Smart Academic Intelligence System (SAIS) using empirical computations on the UCI Mathematics dataset.
    </div>
</body>
</html>
"""
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate HTML report: {str(e)}")

