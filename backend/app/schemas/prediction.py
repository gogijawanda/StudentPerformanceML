"""
Pydantic schemas for grade predictions, academic risk indicators, batch processing, and universal student predictions.
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from app.schemas.student import StudentInputUnion


class GradePredictionRequest(BaseModel):
    student: StudentInputUnion
    mode: Literal["early", "grade_assisted"] = Field(default="early", description="'early' or 'grade_assisted'")
    model_name: Optional[str] = Field(default=None, description="Specific regression model name (defaults to best)")
    high_risk_threshold: float = Field(default=10.0, ge=0.0, le=20.0, description="Threshold below which high support is flagged")
    moderate_risk_threshold: float = Field(default=14.0, ge=0.0, le=20.0, description="Threshold below which moderate support is flagged")


class SupportIndicator(BaseModel):
    level: str
    badge: Literal["critical", "warning", "safe"]
    rule_explanation: str
    thresholds: Dict[str, float]


class GradePredictionResponse(BaseModel):
    mode: str
    model_used: str
    model_test_metrics: Dict[str, float]
    predicted_grade: float
    raw_grade: float
    scale: str = "0 to 20"
    support_indicator: SupportIndicator
    influencing_factors: List[str]
    disclaimer: str


class ClassificationRequest(BaseModel):
    student: StudentInputUnion
    mode: Literal["early", "grade_assisted"] = Field(default="early")
    model_name: Optional[str] = Field(default=None)
    pass_threshold: float = Field(default=10.0, ge=0.0, le=20.0)


class ClassificationResponse(BaseModel):
    mode: str
    model_used: str
    outcome: Literal["Pass", "Fail"]
    label: int
    probability_pass: Optional[float] = None
    pass_threshold: float
    test_metrics: Dict[str, Any]
    disclaimer: str


class BatchPredictionRowResult(BaseModel):
    row_index: int
    student_id: Optional[str] = None
    predicted_grade: Optional[float] = None
    support_level: Optional[str] = None
    support_badge: Optional[str] = None
    status: Literal["SUCCESS", "ERROR"]
    error_message: Optional[str] = None
    influencing_factors: List[str] = []


class BatchPredictionResponse(BaseModel):
    mode: str
    model_used: str
    total_rows: int
    valid_rows_count: int
    error_rows_count: int
    mean_predicted_grade: Optional[float] = None
    risk_distribution: Dict[str, int]
    results: List[BatchPredictionRowResult]


class UniversalPredictionResponse(BaseModel):
    student_name: str
    institution_name: str
    education_level: str
    age: int
    predicted_percentage: float
    predicted_cgpa: float
    predicted_grade_20: float
    letter_grade: str
    performance_summary: str
    academic_risk: str
    risk_badge: Literal["safe", "warning", "critical"]
    pass_probability: float
    model_used: str
    personalized_tips: List[str]
    strengths: List[str]
    areas_for_improvement: List[str]
