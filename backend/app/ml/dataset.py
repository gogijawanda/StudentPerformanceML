"""
Dataset loading, verification, and exploratory analysis services.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from app.core.config import DATASET_PATH, TARGET_FEATURE, NUMERICAL_FEATURES_COMMON, CATEGORICAL_FEATURES, GRADE_FEATURES


def load_raw_dataset(path=DATASET_PATH) -> pd.DataFrame:
    """
    Load student dataset using semicolon delimiter with proper type inference.
    """
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {path}")
    
    df = pd.read_csv(path, sep=";")
    # Ensure numerical grade columns are converted to numeric in case of string formatting
    for col in ["G1", "G2", "G3", "age", "absences"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def get_dataset_overview() -> Dict[str, Any]:
    """
    Compute comprehensive dataset statistics directly from loaded data.
    """
    df = load_raw_dataset()
    total_records = int(len(df))
    total_features = int(df.shape[1])
    
    # Missing values
    missing_dict = df.isnull().sum().to_dict()
    total_missing = int(sum(missing_dict.values()))
    
    # Duplicate check
    duplicate_count = int(df.duplicated().sum())
    
    # Target stats (G3)
    g3 = df[TARGET_FEATURE].dropna()
    mean_g3 = float(g3.mean())
    median_g3 = float(g3.median())
    std_g3 = float(g3.std())
    min_g3 = float(g3.min())
    max_g3 = float(g3.max())
    
    # Grade distribution (0-20 bins)
    grade_bins = [0, 4, 9, 13, 16, 20]
    grade_labels = ["0-4 (Critical/Very Low)", "5-9 (Fail)", "10-13 (Sufficient)", "14-16 (Good)", "17-20 (Excellent)"]
    grade_cut = pd.cut(g3, bins=[-0.1, 4.5, 9.5, 13.5, 16.5, 20.0], labels=grade_labels)
    grade_distribution = [{"category": label, "count": int((grade_cut == label).sum())} for label in grade_labels]
    
    # Study time distribution
    study_map = {1: "< 2 hours", 2: "2 to 5 hours", 3: "5 to 10 hours", 4: "> 10 hours"}
    study_counts = df["studytime"].value_counts().sort_index()
    study_distribution = [{"time_bracket": study_map.get(k, str(k)), "students": int(v)} for k, v in study_counts.items()]
    
    # Absences distribution
    absence_bins = pd.cut(df["absences"], bins=[-0.1, 2, 5, 10, 20, 100], labels=["0-2 days", "3-5 days", "6-10 days", "11-20 days", ">20 days"])
    absence_distribution = [{"category": str(k), "count": int(v)} for k, v in absence_bins.value_counts().sort_index().items()]
    
    # Past failures vs G3
    failure_impact = df.groupby("failures")[TARGET_FEATURE].agg(["mean", "count"]).reset_index()
    failure_impact_list = [
        {"failures": int(row["failures"]), "mean_grade": round(float(row["mean"]), 2), "student_count": int(row["count"])}
        for _, row in failure_impact.iterrows()
    ]
    
    # Gender distribution
    gender_counts = df["sex"].value_counts().to_dict()
    gender_distribution = [{"gender": "Female (F)" if k == "F" else "Male (M)", "count": int(v)} for k, v in gender_counts.items()]
    
    # School distribution
    school_counts = df["school"].value_counts().to_dict()
    school_distribution = [{"school": "Gabriel Pereira (GP)" if k == "GP" else "Mousinho da Silveira (MS)", "count": int(v)} for k, v in school_counts.items()]

    return {
        "total_records": total_records,
        "total_features": total_features,
        "total_missing": total_missing,
        "duplicate_count": duplicate_count,
        "mean_final_grade": round(mean_g3, 2),
        "median_final_grade": round(median_g3, 2),
        "std_final_grade": round(std_g3, 2),
        "min_final_grade": min_g3,
        "max_final_grade": max_g3,
        "grade_distribution": grade_distribution,
        "study_distribution": study_distribution,
        "absence_distribution": absence_distribution,
        "failure_impact": failure_impact_list,
        "gender_distribution": gender_distribution,
        "school_distribution": school_distribution
    }


def get_dataset_preview(page: int = 1, page_size: int = 15, search: Optional[str] = None) -> Dict[str, Any]:
    """
    Paginated, searchable preview of raw dataset rows with metadata.
    """
    df = load_raw_dataset()
    
    if search:
        search_lower = search.strip().lower()
        # Search text columns
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(search_lower).any(), axis=1)
        df_filtered = df[mask]
    else:
        df_filtered = df
        
    total_records = len(df_filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    records = df_filtered.iloc[start_idx:end_idx].to_dict(orient="records")
    
    # Column metadata
    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        columns.append({
            "name": col,
            "type": "categorical" if col in CATEGORICAL_FEATURES else "numerical",
            "dtype": dtype,
            "unique_values": int(df[col].nunique())
        })
        
    return {
        "columns": columns,
        "total_records": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total_records + page_size - 1) // page_size),
        "data": records
    }


def get_dataset_summary_statistics() -> Dict[str, Any]:
    """
    Full numerical summary and categorical frequencies for dataset explorer.
    """
    df = load_raw_dataset()
    
    # Numerical describe
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    desc = df[num_cols].describe().T
    num_summary = []
    for col, row in desc.iterrows():
        num_summary.append({
            "feature": col,
            "mean": round(float(row["mean"]), 2),
            "std": round(float(row["std"]), 2),
            "min": float(row["min"]),
            "q25": float(row["25%"]),
            "median": float(row["50%"]),
            "q75": float(row["75%"]),
            "max": float(row["max"])
        })
        
    # Categorical summary
    cat_summary = []
    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            val_counts = df[col].value_counts().to_dict()
            cat_summary.append({
                "feature": col,
                "cardinality": int(len(val_counts)),
                "frequencies": {str(k): int(v) for k, v in val_counts.items()}
            })
            
    # Correlation matrix of numerical features with G3
    corr = df[num_cols].corr().round(3)
    corr_matrix = {
        "features": num_cols,
        "matrix": corr.values.tolist(),
        "target_correlations": [
            {"feature": col, "correlation": round(float(corr.loc[col, TARGET_FEATURE]), 3)}
            for col in num_cols if col != TARGET_FEATURE
        ]
    }
    # Sort target correlations descending by absolute value
    corr_matrix["target_correlations"].sort(key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "numerical_summary": num_summary,
        "categorical_summary": cat_summary,
        "correlation_analysis": corr_matrix,
        "total_rows": int(len(df)),
        "total_columns": int(df.shape[1])
    }

