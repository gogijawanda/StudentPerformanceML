"""
Inference API: individual grade prediction, classification, and batch CSV processing.
"""
from typing import Optional, List
import io
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import Response

from app.schemas.prediction import (
    GradePredictionRequest, GradePredictionResponse,
    ClassificationRequest, ClassificationResponse,
    BatchPredictionResponse, BatchPredictionRowResult,
    UniversalPredictionResponse
)
from app.schemas.student import UniversalStudentRequest
from app.ml.pipeline_manager import pipeline_manager
from app.core.config import (
    EARLY_FEATURES, GRADE_ASSISTED_FEATURES,
    CATEGORICAL_OPTIONS, NUMERICAL_RANGES,
    DEFAULT_HIGH_RISK_THRESHOLD, DEFAULT_MODERATE_RISK_THRESHOLD
)

router = APIRouter(prefix="/api/predict", tags=["Prediction"])


@router.post("/grade", response_model=GradePredictionResponse)
def predict_grade(payload: GradePredictionRequest):
    """
    Predict final math grade (G3, 0-20) and assess academic support need.
    """
    try:
        student_dict = payload.student.model_dump()
        
        # In grade-assisted mode, check G1 and G2 are provided
        if payload.mode == "grade_assisted":
            if student_dict.get("G1") is None or student_dict.get("G2") is None:
                raise HTTPException(
                    status_code=400,
                    detail="In Grade-Assisted mode, both G1 and G2 must be provided."
                )

        result = pipeline_manager.predict_single_student(
            student_data=student_dict,
            mode=payload.mode,
            model_name=payload.model_name,
            high_risk_threshold=payload.high_risk_threshold,
            moderate_risk_threshold=payload.moderate_risk_threshold
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/classification", response_model=ClassificationResponse)
def predict_pass_fail(payload: ClassificationRequest):
    """
    Predict binary Pass/Fail academic outcome with probability estimation.
    """
    try:
        artifacts = pipeline_manager.load_artifacts()
        clf_mode = artifacts["classification"][payload.mode]
        
        selected_model_name = payload.model_name or clf_mode["best_model_name"]
        if selected_model_name not in clf_mode["models"]:
            selected_model_name = clf_mode["best_model_name"]

        model_entry = clf_mode["models"][selected_model_name]
        pipeline = model_entry["pipeline"]
        test_metrics = model_entry["metrics"]

        student_dict = payload.student.model_dump()
        if payload.mode == "grade_assisted":
            if student_dict.get("G1") is None or student_dict.get("G2") is None:
                raise HTTPException(
                    status_code=400,
                    detail="In Grade-Assisted mode, both G1 and G2 must be provided."
                )

        expected_cols = EARLY_FEATURES if payload.mode == "early" else GRADE_ASSISTED_FEATURES
        row_dict = {col: [student_dict.get(col)] for col in expected_cols}
        df_row = pd.DataFrame(row_dict)

        pred_label = int(pipeline.predict(df_row)[0])
        outcome = "Pass" if pred_label == 1 else "Fail"

        prob_pass = None
        if hasattr(pipeline, "predict_proba"):
            try:
                prob_pass = round(float(pipeline.predict_proba(df_row)[0][1]), 4)
            except Exception:
                prob_pass = None

        return {
            "mode": payload.mode,
            "model_used": selected_model_name,
            "outcome": outcome,
            "label": pred_label,
            "probability_pass": prob_pass,
            "pass_threshold": payload.pass_threshold,
            "test_metrics": test_metrics,
            "disclaimer": "Pass/Fail outcome is estimated by a statistical classification model. Educational outcomes may vary."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification prediction failed: {str(e)}")


@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch_csv(
    file: UploadFile = File(...),
    mode: str = Form("early"),
    model_name: Optional[str] = Form(None),
    high_risk_threshold: float = Form(DEFAULT_HIGH_RISK_THRESHOLD),
    moderate_risk_threshold: float = Form(DEFAULT_MODERATE_RISK_THRESHOLD)
):
    """
    Process an uploaded CSV file, validate row schemas, generate grade predictions and support indicators.
    """
    # 1. Validate file extension & size (< 5MB)
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 5MB.")

    # 2. Parse CSV
    try:
        # Detect delimiter (comma or semicolon)
        sample = contents[:2048].decode("utf-8", errors="ignore")
        sep = ";" if sample.count(";") > sample.count(",") else ","
        df_uploaded = pd.read_csv(io.BytesIO(contents), sep=sep)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if df_uploaded.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV file contains no data.")

    expected_cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
    missing_cols = [c for c in expected_cols if c not in df_uploaded.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded CSV is missing required columns: {', '.join(missing_cols[:8])}{'...' if len(missing_cols) > 8 else ''}"
        )

    # 3. Load ML model
    artifacts = pipeline_manager.load_artifacts()
    reg_mode = artifacts["regression"][mode]
    selected_model_name = model_name or reg_mode["best_model_name"]
    if selected_model_name not in reg_mode["models"]:
        selected_model_name = reg_mode["best_model_name"]
    pipeline = reg_mode["models"][selected_model_name]["pipeline"]

    results: List[BatchPredictionRowResult] = []
    valid_predictions = []
    risk_counts = {"High Support Needed": 0, "Moderate Support Needed": 0, "Low Support Needed": 0}

    # 4. Row-by-row validation & inference
    for idx, row in df_uploaded.iterrows():
        row_dict = row.to_dict()
        row_errors = []

        # Validate categorical values
        for cat_col, valid_vals in CATEGORICAL_OPTIONS.items():
            if cat_col in row_dict and pd.notna(row_dict[cat_col]):
                val_str = str(row_dict[cat_col]).strip()
                if val_str not in valid_vals:
                    row_errors.append(f"Invalid '{cat_col}': '{val_str}' (expected: {valid_vals})")
            elif cat_col in expected_cols and pd.isna(row_dict.get(cat_col)):
                row_errors.append(f"Missing required field: '{cat_col}'")

        # Validate numerical ranges
        for num_col in (NUMERICAL_RANGES.keys()):
            if num_col in expected_cols:
                val = row_dict.get(num_col)
                if pd.isna(val):
                    row_errors.append(f"Missing numerical value for: '{num_col}'")
                else:
                    try:
                        num_val = float(val)
                        min_v, max_v = NUMERICAL_RANGES[num_col]
                        if not (min_v <= num_val <= max_v):
                            row_errors.append(f"'{num_col}' value {num_val} outside range [{min_v}, {max_v}]")
                    except ValueError:
                        row_errors.append(f"Non-numeric value '{val}' for '{num_col}'")

        if row_errors:
            results.append(BatchPredictionRowResult(
                row_index=idx + 1,
                student_id=str(row_dict.get("student_id", f"Row-{idx+1}")),
                status="ERROR",
                error_message="; ".join(row_errors)
            ))
            continue

        # Predict valid row
        try:
            df_single = pd.DataFrame([{col: row_dict[col] for col in expected_cols}])
            raw_pred = float(pipeline.predict(df_single)[0])
            pred_grade = round(float(np.clip(raw_pred, 0.0, 20.0)), 2)
            valid_predictions.append(pred_grade)

            if pred_grade < high_risk_threshold:
                level = "High Support Needed"
                badge = "critical"
            elif pred_grade < moderate_risk_threshold:
                level = "Moderate Support Needed"
                badge = "warning"
            else:
                level = "Low Support Needed"
                badge = "safe"

            risk_counts[level] += 1

            influencing = []
            if float(row_dict.get("failures", 0)) > 0:
                influencing.append(f"Past failures: {row_dict.get('failures')}")
            if float(row_dict.get("absences", 0)) > 8:
                influencing.append(f"Absences: {row_dict.get('absences')}")

            results.append(BatchPredictionRowResult(
                row_index=idx + 1,
                student_id=str(row_dict.get("student_id", f"Student-{idx+1}")),
                predicted_grade=pred_grade,
                support_level=level,
                support_badge=badge,
                status="SUCCESS",
                influencing_factors=influencing
            ))
        except Exception as pred_err:
            results.append(BatchPredictionRowResult(
                row_index=idx + 1,
                student_id=str(row_dict.get("student_id", f"Row-{idx+1}")),
                status="ERROR",
                error_message=f"Prediction pipeline error: {str(pred_err)}"
            ))

    valid_count = len(valid_predictions)
    error_count = len(results) - valid_count
    mean_pred = round(float(np.mean(valid_predictions)), 2) if valid_predictions else None

    return BatchPredictionResponse(
        mode=mode,
        model_used=selected_model_name,
        total_rows=len(df_uploaded),
        valid_rows_count=valid_count,
        error_rows_count=error_count,
        mean_predicted_grade=mean_pred,
        risk_distribution=risk_counts,
        results=results
    )


@router.post("/universal", response_model=UniversalPredictionResponse)
def predict_universal(payload: UniversalStudentRequest):
    """
    Simplified universal prediction endpoint suitable for ANY school, college, or university student.
    Accepts intuitive percentages, study hours, attendance, and backlogs.
    Returns Percentage (%), CGPA (0-10), Letter Grade, Risk Status, and Actionable Guidance.
    """
    # 1. Map study hours to model study bracket (1 to 4)
    if payload.weekly_study_hours < 2.0:
        studytime = 1
    elif payload.weekly_study_hours < 5.0:
        studytime = 2
    elif payload.weekly_study_hours <= 10.0:
        studytime = 3
    else:
        studytime = 4

    # 2. Map attendance percentage to model absences (0 to 93)
    calculated_absences = max(0, min(60, int(round((100.0 - payload.attendance_percentage) * 0.45))))

    # 3. Age clamped for internal tree compatibility (preserves user's actual age in output)
    clamped_age = max(15, min(22, payload.age))

    # 4. Failures clamped
    clamped_failures = max(0, min(4, payload.past_backlogs))

    # 5. Health & Freetime mappings
    health_map = {"Poor": 1, "Average": 3, "Good": 4, "Excellent": 5}
    health_val = health_map.get(payload.health_condition, 4)

    freetime_map = {"Low": 2, "Moderate": 3, "High": 5}
    freetime_val = freetime_map.get(payload.social_freetime, 3)

    # 6. Mode & Grades
    has_prior_score = payload.previous_score_percent is not None
    mode = "grade_assisted" if has_prior_score else "early"
    
    # Convert previous percentage to 0-20 scale if available
    g_score = None
    if has_prior_score:
        g_score = float(np.clip((payload.previous_score_percent / 100.0) * 20.0, 0.0, 20.0))

    student_dict = {
        "school": "GP",
        "sex": "F" if payload.gender == "Female" else "M",
        "age": clamped_age,
        "address": "U",
        "famsize": "GT3",
        "Pstatus": "T",
        "Medu": 3,
        "Fedu": 3,
        "Mjob": "other",
        "Fjob": "other",
        "reason": "course",
        "guardian": "mother",
        "traveltime": 1,
        "studytime": studytime,
        "failures": clamped_failures,
        "schoolsup": "no",
        "famsup": "yes",
        "paid": "yes" if payload.extra_coaching else "no",
        "activities": "yes",
        "nursery": "yes",
        "higher": "yes" if payload.aims_higher_studies else "no",
        "internet": "yes" if payload.has_internet else "no",
        "romantic": "no",
        "famrel": 4,
        "freetime": freetime_val,
        "goout": 3,
        "Dalc": 1,
        "Walc": 1,
        "health": health_val,
        "absences": calculated_absences,
    }

    if has_prior_score:
        student_dict["G1"] = g_score
        student_dict["G2"] = g_score

    # Run ML prediction
    grade_res = pipeline_manager.predict_single_student(
        student_data=student_dict,
        mode=mode,
        high_risk_threshold=10.0,
        moderate_risk_threshold=14.0
    )

    pred_grade_20 = grade_res["predicted_grade"]
    predicted_pct = round((pred_grade_20 / 20.0) * 100.0, 1)
    predicted_cgpa = round(pred_grade_20 / 2.0, 2)

    # Letter Grade & Performance Summary
    if predicted_pct >= 85.0:
        letter = "A+ (Outstanding)"
        perf_summary = "Outstanding academic trajectory. Demonstrates excellent conceptual grasp and consistent study discipline."
    elif predicted_pct >= 75.0:
        letter = "A (Excellent)"
        perf_summary = "Strong academic standing. Shows consistent preparation and high potential for honors performance."
    elif predicted_pct >= 65.0:
        letter = "B+ (Very Good)"
        perf_summary = "Above-average academic performance. Solid foundation with room for targeted score optimization."
    elif predicted_pct >= 55.0:
        letter = "B (Good / Average)"
        perf_summary = "Satisfactory progress. Meeting core passing requirements, but vulnerable to difficult exam topics."
    elif predicted_pct >= 45.0:
        letter = "C (Pass / Needs Support)"
        perf_summary = "Borderline passing performance. Targeted academic assistance and study reinforcement strongly recommended."
    else:
        letter = "F (At-Risk / Critical)"
        perf_summary = "Critical academic risk detected. High probability of failing upcoming examinations without immediate intervention."

    # Risk Level & Badge
    if pred_grade_20 < 10.0:
        academic_risk = "High Support Needed (Critical At-Risk)"
        risk_badge = "critical"
    elif pred_grade_20 < 14.0:
        academic_risk = "Moderate Support Needed (Needs Reinforcement)"
        risk_badge = "warning"
    else:
        academic_risk = "Low Support Needed (Stable & Safe)"
        risk_badge = "safe"

    # Pass probability calculation via classification pipeline
    pass_prob = 0.5
    try:
        artifacts = pipeline_manager.load_artifacts()
        clf_mode = artifacts["classification"][mode]
        best_clf = clf_mode["models"][clf_mode["best_model_name"]]["pipeline"]
        expected_cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
        df_row = pd.DataFrame([{col: student_dict[col] for col in expected_cols}])
        if hasattr(best_clf, "predict_proba"):
            pass_prob = round(float(best_clf.predict_proba(df_row)[0][1]), 2)
        else:
            pass_prob = 0.9 if pred_grade_20 >= 10.0 else 0.2
    except Exception:
        pass_prob = round(min(0.99, max(0.05, predicted_pct / 100.0)), 2)

    # Identify Strengths
    strengths = []
    if payload.attendance_percentage >= 80.0:
        strengths.append(f"Strong attendance record ({payload.attendance_percentage}%) promotes lecture retention.")
    if payload.weekly_study_hours >= 6.0:
        strengths.append(f"Consistent self-study routine ({payload.weekly_study_hours} hrs/week).")
    if payload.past_backlogs == 0:
        strengths.append("Clean academic track with zero prior failed subjects or backlogs.")
    if has_prior_score and payload.previous_score_percent >= 70.0:
        strengths.append(f"Solid prior exam foundation ({payload.previous_score_percent}% in recent evaluations).")
    if payload.aims_higher_studies:
        strengths.append("High personal drive and aspiration for degree advancement / career growth.")
    if payload.has_internet:
        strengths.append("Access to online educational resources, lecture recordings, and reference materials.")

    # Identify Areas for Improvement
    areas = []
    if payload.attendance_percentage < 75.0:
        areas.append(f"Class attendance is at {payload.attendance_percentage}%. Missing classes creates conceptual gaps.")
    if payload.weekly_study_hours < 4.0:
        areas.append(f"Self-study is {payload.weekly_study_hours} hrs/week. Highly recommended to increase to at least 1 hour daily.")
    if payload.past_backlogs > 0:
        areas.append(f"{payload.past_backlogs} pending backlog(s) may create compounding academic pressure.")
    if has_prior_score and payload.previous_score_percent < 50.0:
        areas.append("Previous score below passing standard; foundational topics need revision.")
    if not payload.has_internet:
        areas.append("Limited internet access at home; utilize campus library and computer labs for materials.")

    # Generate Personalized Actionable Tips
    tips = []
    if payload.attendance_percentage < 80.0:
        tips.append("Prioritize attending at least 85% of lectures over the next month to secure internal marks.")
    if payload.weekly_study_hours < 6.0:
        needed_hrs = max(4.0, payload.weekly_study_hours + 2.0)
        tips.append(f"Add a 45-minute daily study block to increase weekly self-study to ~{needed_hrs:.0f} hours.")
    if payload.past_backlogs > 0:
        tips.append("Create a dedicated weekend schedule specifically focused on clearing backlogs before finals.")
    if has_prior_score and payload.previous_score_percent < 60.0:
        tips.append("Attend faculty office hours or peer mentoring sessions for 1-on-1 problem-solving clarification.")
    tips.append("Practice past question papers under timed conditions 2 weeks before major assessments.")

    return UniversalPredictionResponse(
        student_name=payload.student_name,
        institution_name=payload.institution_name,
        education_level=payload.education_level,
        age=payload.age,
        predicted_percentage=predicted_pct,
        predicted_cgpa=predicted_cgpa,
        predicted_grade_20=pred_grade_20,
        letter_grade=letter,
        performance_summary=perf_summary,
        academic_risk=academic_risk,
        risk_badge=risk_badge,
        pass_probability=pass_prob,
        model_used=grade_res["model_used"],
        personalized_tips=tips,
        strengths=strengths if strengths else ["Showing readiness to assess and optimize academic performance."],
        areas_for_improvement=areas if areas else ["Maintain current academic routine and consistent study schedule."]
    )

