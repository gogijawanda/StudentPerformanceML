"""
API endpoint integration tests calling route handlers with genuine inputs.
"""
import io
import pytest
from app.api.routes_overview import get_overview_data
from app.api.routes_dataset import get_summary, get_preview, download_template
from app.api.routes_models import get_regression_metrics, get_classification_metrics
from app.api.routes_predict import predict_grade, predict_pass_fail, predict_universal
from app.api.routes_analysis import get_segmentation, get_explainability
from app.schemas.prediction import GradePredictionRequest, ClassificationRequest
from app.schemas.student import StudentInputUnion, UniversalStudentRequest


def test_overview_endpoint_data():
    res = get_overview_data()
    assert res["status"] == "success"
    assert res["models_trained"] is True
    assert res["dataset"]["total_records"] == 395
    assert res["dataset"]["total_features"] == 33
    assert len(res["dataset"]["grade_distribution"]) == 5


def test_dataset_preview_and_pagination():
    preview = get_preview(page=1, page_size=10, search=None)
    assert len(preview["data"]) == 10
    assert preview["total_records"] == 395
    assert preview["total_pages"] == 40
    assert len(preview["columns"]) == 33


def test_dataset_summary_endpoint():
    summary = get_summary()
    assert len(summary["numerical_summary"]) == 16
    assert len(summary["categorical_summary"]) == 17
    assert "target_correlations" in summary["correlation_analysis"]


def test_dataset_template_download():
    early_template = download_template(mode="early")
    assert early_template.status_code == 200
    assert "G1" not in early_template.body.decode("utf-8")

    assisted_template = download_template(mode="grade_assisted")
    assert assisted_template.status_code == 200
    assert "G1" in assisted_template.body.decode("utf-8")


def test_model_metrics_endpoints():
    reg = get_regression_metrics()
    assert "early" in reg
    assert "grade_assisted" in reg
    assert len(reg["early"]["models"]) == 4
    assert len(reg["grade_assisted"]["models"]) == 4

    clf = get_classification_metrics()
    assert "early" in clf
    assert len(clf["early"]["models"]) == 3


def test_predict_grade_early():
    student = StudentInputUnion(
        school="GP", sex="F", age=16, address="U", famsize="GT3",
        Pstatus="T", Medu=4, Fedu=4, Mjob="teacher", Fjob="services",
        reason="reputation", guardian="mother", traveltime=1, studytime=3,
        failures=0, schoolsup="no", famsup="yes", paid="no",
        activities="yes", nursery="yes", higher="yes", internet="yes",
        romantic="no", famrel=5, freetime=3, goout=2, Dalc=1,
        Walc=1, health=5, absences=2
    )
    req = GradePredictionRequest(
        student=student,
        mode="early",
        high_risk_threshold=10.0,
        moderate_risk_threshold=14.0
    )
    res = predict_grade(req)
    assert 0.0 <= res["predicted_grade"] <= 20.0
    assert res["support_indicator"]["level"] in [
        "High Support Needed", "Moderate Support Needed", "Low Support Needed"
    ]
    assert len(res["influencing_factors"]) > 0


def test_predict_grade_assisted():
    student = StudentInputUnion(
        school="GP", sex="M", age=15, address="U", famsize="LE3",
        Pstatus="T", Medu=4, Fedu=3, Mjob="health", Fjob="services",
        reason="home", guardian="father", traveltime=1, studytime=2,
        failures=0, schoolsup="no", famsup="yes", paid="yes",
        activities="yes", nursery="yes", higher="yes", internet="yes",
        romantic="no", famrel=4, freetime=3, goout=3, Dalc=1,
        Walc=1, health=5, absences=0,
        G1=16.0, G2=17.0
    )
    req = GradePredictionRequest(
        student=student,
        mode="grade_assisted"
    )
    res = predict_grade(req)
    assert res["predicted_grade"] >= 13.0


def test_predict_classification():
    student = StudentInputUnion(
        school="GP", sex="F", age=16, address="U", famsize="GT3",
        Pstatus="T", Medu=3, Fedu=3, Mjob="other", Fjob="other",
        reason="home", guardian="mother", traveltime=1, studytime=2,
        failures=0, schoolsup="no", famsup="yes", paid="no",
        activities="yes", nursery="yes", higher="yes", internet="yes",
        romantic="no", famrel=4, freetime=3, goout=3, Dalc=1,
        Walc=1, health=4, absences=2
    )
    req = ClassificationRequest(student=student, mode="early")
    res = predict_pass_fail(req)
    assert res["outcome"] in ["Pass", "Fail"]
    assert res["label"] in [0, 1]


def test_segmentation_analysis():
    seg = get_segmentation(n_clusters=3)
    assert seg["n_clusters"] == 3
    assert len(seg["cluster_summaries"]) == 3
    assert len(seg["data_points"]) == 395


def test_explainability_analysis():
    exp = get_explainability(mode="early")
    assert exp["mode"] == "early"
    assert len(exp["feature_importances"]) > 0
    assert len(exp["predictions_sample"]) > 0


def test_predict_universal_college_student():
    req = UniversalStudentRequest(
        student_name="Priya Sharma",
        institution_name="National Institute of Technology",
        education_level="College / Undergraduate (B.Tech, BCA, B.Sc, B.Com)",
        age=21,
        gender="Female",
        weekly_study_hours=12.0,
        attendance_percentage=92.0,
        previous_score_percent=82.0,
        past_backlogs=0,
        has_internet=True,
        extra_coaching=False,
        aims_higher_studies=True,
        health_condition="Good",
        social_freetime="Moderate"
    )
    res = predict_universal(req)
    assert res.student_name == "Priya Sharma"
    assert res.age == 21
    assert 0.0 <= res.predicted_percentage <= 100.0
    assert 0.0 <= res.predicted_cgpa <= 10.0
    assert "A" in res.letter_grade or "B" in res.letter_grade
    assert res.risk_badge in ["safe", "warning", "critical"]
    assert len(res.personalized_tips) > 0
    assert len(res.strengths) > 0


