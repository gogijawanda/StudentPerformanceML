"""
Pydantic schemas for student attributes and validation.
Supports both classic UCI format and Universal Student input for any age, school, or college.
"""
from typing import Optional, Literal
from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    # Relaxed constraints to allow any school or demographic
    school: str = Field(default="GP", description="Student's school or institution identifier")
    sex: Literal["F", "M"] = Field(default="F", description="Student's sex: F or M")
    age: int = Field(default=16, ge=10, le=70, description="Student's age: 10 to 70")
    address: Literal["U", "R"] = Field(default="U", description="Home address type: U (urban) or R (rural)")
    famsize: Literal["LE3", "GT3"] = Field(default="GT3", description="Family size: LE3 (<=3) or GT3 (>3)")
    Pstatus: Literal["T", "A"] = Field(default="T", description="Parent's cohabitation status: T (together) or A (apart)")
    Medu: int = Field(default=2, ge=0, le=4, description="Mother's education (0: none, 4: higher)")
    Fedu: int = Field(default=2, ge=0, le=4, description="Father's education (0: none, 4: higher)")
    Mjob: Literal["teacher", "health", "services", "at_home", "other"] = Field(default="other", description="Mother's job")
    Fjob: Literal["teacher", "health", "services", "at_home", "other"] = Field(default="other", description="Father's job")
    reason: Literal["home", "reputation", "course", "other"] = Field(default="course", description="Reason for choosing institution")
    guardian: Literal["mother", "father", "other"] = Field(default="mother", description="Student's guardian")
    traveltime: int = Field(default=1, ge=1, le=4, description="Home to school travel time (1: <15 min, 4: >1 hour)")
    studytime: int = Field(default=2, ge=1, le=4, description="Weekly study time (1: <2 hrs, 4: >10 hrs)")
    failures: int = Field(default=0, ge=0, le=10, description="Number of past class failures / backlogs")
    schoolsup: Literal["yes", "no"] = Field(default="no", description="Extra educational support")
    famsup: Literal["yes", "no"] = Field(default="no", description="Family educational support")
    paid: Literal["yes", "no"] = Field(default="no", description="Extra paid classes / coaching")
    activities: Literal["yes", "no"] = Field(default="no", description="Extra-curricular activities")
    nursery: Literal["yes", "no"] = Field(default="yes", description="Attended nursery / early schooling")
    higher: Literal["yes", "no"] = Field(default="yes", description="Wants to take higher education / degree")
    internet: Literal["yes", "no"] = Field(default="yes", description="Internet access at home / campus")
    romantic: Literal["yes", "no"] = Field(default="no", description="In a relationship")
    famrel: int = Field(default=4, ge=1, le=5, description="Quality of family relationships (1: bad to 5: excellent)")
    freetime: int = Field(default=3, ge=1, le=5, description="Free time after classes (1: very low to 5: very high)")
    goout: int = Field(default=3, ge=1, le=5, description="Socializing with friends (1: very low to 5: very high)")
    Dalc: int = Field(default=1, ge=1, le=5, description="Workday alcohol consumption (1: very low to 5: very high)")
    Walc: int = Field(default=1, ge=1, le=5, description="Weekend alcohol consumption (1: very low to 5: very high)")
    health: int = Field(default=4, ge=1, le=5, description="Current health status (1: very bad to 5: very good)")
    absences: int = Field(default=2, ge=0, le=150, description="Number of school/college absences")


class StudentEarly(StudentBase):
    pass


class StudentGradeAssisted(StudentBase):
    G1: float = Field(default=11.0, ge=0.0, le=20.0, description="Period 1 grade (0 to 20)")
    G2: float = Field(default=11.0, ge=0.0, le=20.0, description="Period 2 grade (0 to 20)")


class StudentInputUnion(StudentBase):
    G1: Optional[float] = Field(default=None, ge=0.0, le=20.0, description="Period 1 grade")
    G2: Optional[float] = Field(default=None, ge=0.0, le=20.0, description="Period 2 grade")


class UniversalStudentRequest(BaseModel):
    """
    Simplified, human-friendly student input for ANY school, college, or university student.
    Accepts standard percentages, CGPA, hours, and attendance.
    """
    student_name: str = Field(default="Student", description="Name of the student")
    institution_name: str = Field(default="College / University", description="School, College, or University name")
    education_level: Literal["Middle / High School", "Senior Secondary (11th-12th)", "College / Undergraduate (B.Tech, BCA, B.Sc, B.Com)", "Postgraduate (MCA, MBA, M.Tech)"] = Field(
        default="College / Undergraduate (B.Tech, BCA, B.Sc, B.Com)",
        description="Education Level"
    )
    age: int = Field(default=20, ge=10, le=70, description="Student's Age (10 to 70)")
    gender: Literal["Female", "Male", "Other"] = Field(default="Female", description="Gender")
    
    # Core performance drivers
    weekly_study_hours: float = Field(default=8.0, ge=0.0, le=80.0, description="Weekly Self-Study Hours")
    attendance_percentage: float = Field(default=85.0, ge=0.0, le=100.0, description="Class Attendance (0 to 100%)")
    previous_score_percent: Optional[float] = Field(default=75.0, ge=0.0, le=100.0, description="Previous Exam Score (0 to 100%) or mid-term average")
    past_backlogs: int = Field(default=0, ge=0, le=10, description="Number of past failed subjects / backlogs")
    
    # Supportive attributes
    has_internet: bool = Field(default=True, description="Reliable internet access for study")
    extra_coaching: bool = Field(default=False, description="Enrolled in extra coaching or tutoring")
    aims_higher_studies: bool = Field(default=True, description="Aims for higher degree / placement")
    health_condition: Literal["Poor", "Average", "Good", "Excellent"] = Field(default="Good", description="General health and well-being")
    social_freetime: Literal["Low", "Moderate", "High"] = Field(default="Moderate", description="Free time spent socializing")
