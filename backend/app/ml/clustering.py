"""
Student segmentation and exploratory clustering using K-Means and PCA.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

from app.core.config import CLUSTERING_FEATURES, RANDOM_STATE


def perform_student_clustering(df: pd.DataFrame, n_clusters: int = 3) -> Dict[str, Any]:
    """
    K-Means clustering on behavioral and demographic features (excluding target grade).
    Provides PCA 2D projections and cluster profiling.
    """
    features = list(CLUSTERING_FEATURES)
    X = df[features].copy()
    
    # Standardize numerical features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Fit K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=RANDOM_STATE, n_init=10)
    cluster_labels = kmeans.fit_predict(X_scaled)

    # 2D PCA projection for visualization
    pca = PCA(n_components=2, random_state=RANDOM_STATE)
    X_pca = pca.fit_transform(X_scaled)
    explained_variance = [round(float(v * 100), 2) for v in pca.explained_variance_ratio_]

    # Assign cluster labels to original df for profiling
    df_clustered = df.copy()
    df_clustered["cluster"] = cluster_labels
    df_clustered["pca_x"] = np.round(X_pca[:, 0], 3)
    df_clustered["pca_y"] = np.round(X_pca[:, 1], 3)

    # Cluster profiles & feature means
    cluster_summaries = []
    total_students = len(df)
    
    # Key indicator columns to profile
    profile_cols = ["studytime", "absences", "failures", "Medu", "Fedu", "freetime", "goout", "Walc", "health", "G3"]

    for c_id in range(n_clusters):
        subset = df_clustered[df_clustered["cluster"] == c_id]
        size = len(subset)
        pct = round(size / total_students * 100, 1)

        feature_averages = {}
        for col in profile_cols:
            if col in subset.columns:
                feature_averages[col] = round(float(subset[col].mean()), 2)

        # Generate objective descriptive traits based on computed feature averages
        traits = []
        if feature_averages.get("studytime", 0) >= 2.5:
            traits.append("Higher weekly study investment")
        elif feature_averages.get("studytime", 0) < 1.8:
            traits.append("Lower reported study hours")

        if feature_averages.get("absences", 0) > 8.0:
            traits.append("Elevated absenteeism")
        elif feature_averages.get("absences", 0) <= 4.0:
            traits.append("Consistent class attendance")

        if feature_averages.get("failures", 0) > 0.5:
            traits.append("History of past academic struggles")
        else:
            traits.append("Minimal past course failures")

        if feature_averages.get("Walc", 0) > 2.5:
            traits.append("Higher weekend social alcohol consumption")

        cluster_summaries.append({
            "cluster_id": c_id,
            "label": f"Student Segment {c_id + 1}",
            "student_count": size,
            "percentage": pct,
            "feature_averages": feature_averages,
            "descriptive_traits": traits
        })

    # Sample points for scatter plot (first 150 or full sample)
    points = []
    for idx, row in df_clustered.iterrows():
        points.append({
            "id": int(idx),
            "cluster": int(row["cluster"]),
            "pca_x": float(row["pca_x"]),
            "pca_y": float(row["pca_y"]),
            "studytime": int(row["studytime"]),
            "absences": int(row["absences"]),
            "g3": float(row["G3"]) if "G3" in row else None
        })

    return {
        "n_clusters": n_clusters,
        "features_used": features,
        "pca_variance_explained": explained_variance,
        "total_variance_explained_pct": round(sum(explained_variance), 2),
        "cluster_summaries": cluster_summaries,
        "data_points": points
    }

