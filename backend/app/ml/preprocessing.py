"""
Feature preprocessing pipelines for Early and Grade-Assisted models.
"""
from typing import List, Tuple
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from app.core.config import CATEGORICAL_FEATURES, NUMERICAL_FEATURES_COMMON, GRADE_FEATURES


def get_preprocessor(mode: str = "early") -> Tuple[ColumnTransformer, List[str], List[str]]:
    """
    Constructs a ColumnTransformer for preprocessing numerical and categorical features.
    
    Modes:
    - 'early': excludes G1 and G2
    - 'grade_assisted': includes G1 and G2
    """
    categorical_cols = list(CATEGORICAL_FEATURES)
    
    if mode == "grade_assisted":
        numerical_cols = list(NUMERICAL_FEATURES_COMMON) + list(GRADE_FEATURES)
    else:
        numerical_cols = list(NUMERICAL_FEATURES_COMMON)

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numerical_cols),
            ("cat", categorical_transformer, categorical_cols)
        ],
        remainder="drop"
    )

    return preprocessor, numerical_cols, categorical_cols

