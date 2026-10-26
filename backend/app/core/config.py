"""
Core configuration and constants for the Smart Academic Intelligence System (SAIS).
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATASET_PATH = DATA_DIR / "student-mat.csv"
DATASET_POR_PATH = DATA_DIR / "student-por.csv"

BACKEND_DIR = BASE_DIR / "backend"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

# Ensure directories exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Random Seed for Reproducibility
RANDOM_STATE = 42
TEST_SIZE = 0.20

# Feature definitions for student-mat.csv
CATEGORICAL_FEATURES = [
    "school", "sex", "address", "famsize", "Pstatus",
    "Mjob", "Fjob", "reason", "guardian", "schoolsup",
    "famsup", "paid", "activities", "nursery", "higher",
    "internet", "romantic"
]

NUMERICAL_FEATURES_COMMON = [
    "age", "Medu", "Fedu", "traveltime", "studytime",
    "failures", "famrel", "freetime", "goout", "Dalc",
    "Walc", "health", "absences"
]

GRADE_FEATURES = ["G1", "G2"]
TARGET_FEATURE = "G3"

# Features for Early Prediction Mode (excluding G1 and G2)
EARLY_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES_COMMON

# Features for Grade-Assisted Mode (including G1 and G2)
GRADE_ASSISTED_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES_COMMON + GRADE_FEATURES

# Clustering numerical features
CLUSTERING_FEATURES = [
    "age", "Medu", "Fedu", "traveltime", "studytime",
    "failures", "famrel", "freetime", "goout", "Dalc",
    "Walc", "health", "absences"
]

# Valid categorical categories mapping
CATEGORICAL_OPTIONS = {
    "school": ["GP", "MS"],
    "sex": ["F", "M"],
    "address": ["U", "R"],
    "famsize": ["LE3", "GT3"],
    "Pstatus": ["T", "A"],
    "Mjob": ["teacher", "health", "services", "at_home", "other"],
    "Fjob": ["teacher", "health", "services", "at_home", "other"],
    "reason": ["home", "reputation", "course", "other"],
    "guardian": ["mother", "father", "other"],
    "schoolsup": ["yes", "no"],
    "famsup": ["yes", "no"],
    "paid": ["yes", "no"],
    "activities": ["yes", "no"],
    "nursery": ["yes", "no"],
    "higher": ["yes", "no"],
    "internet": ["yes", "no"],
    "romantic": ["yes", "no"]
}

# Range restrictions for numerical columns
NUMERICAL_RANGES = {
    "age": (15, 22),
    "Medu": (0, 4),
    "Fedu": (0, 4),
    "traveltime": (1, 4),
    "studytime": (1, 4),
    "failures": (0, 4),
    "famrel": (1, 5),
    "freetime": (1, 5),
    "goout": (1, 5),
    "Dalc": (1, 5),
    "Walc": (1, 5),
    "health": (1, 5),
    "absences": (0, 93),
    "G1": (0, 20),
    "G2": (0, 20),
    "G3": (0, 20)
}

# Default Academic Thresholds
DEFAULT_PASS_THRESHOLD = 10.0
DEFAULT_HIGH_RISK_THRESHOLD = 10.0
DEFAULT_MODERATE_RISK_THRESHOLD = 14.0

# CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

