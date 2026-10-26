export interface DatasetOverview {
  total_records: number;
  total_features: number;
  total_missing: number;
  duplicate_count: number;
  mean_final_grade: number;
  median_final_grade: number;
  std_final_grade: number;
  min_final_grade: number;
  max_final_grade: number;
  grade_distribution: { category: string; count: number }[];
  study_distribution: { time_bracket: string; students: number }[];
  absence_distribution: { category: string; count: number }[];
  failure_impact: { failures: number; mean_grade: number; student_count: number }[];
  gender_distribution: { gender: string; count: number }[];
  school_distribution: { school: string; count: number }[];
}

export interface ModelMetric {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
}

export interface ClassificationMetric {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number | null;
  confusion_matrix: { tn: number; fp: number; fn: number; tp: number };
}

export interface RegressionModelItem {
  name: string;
  metrics: ModelMetric;
  is_best: boolean;
  feature_importances: { feature: string; importance: number }[];
  predictions_sample?: { actual: number; predicted: number; raw_predicted: number; residual: number }[];
}

export interface ClassificationModelItem {
  name: string;
  metrics: ClassificationMetric;
  is_best: boolean;
}

export interface RegressionMetricsResponse {
  [mode: string]: {
    mode: string;
    best_model_name: string;
    train_size: number;
    test_size: number;
    models: RegressionModelItem[];
  };
}

export interface ClassificationMetricsResponse {
  [mode: string]: {
    mode: string;
    best_model_name: string;
    pass_threshold: number;
    class_distribution: { pass_count: number; fail_count: number; pass_rate_pct: number };
    models: ClassificationModelItem[];
  };
}

export interface StudentInput {
  school: string;
  sex: string;
  age: number;
  address: string;
  famsize: string;
  Pstatus: string;
  Medu: number;
  Fedu: number;
  Mjob: string;
  Fjob: string;
  reason: string;
  guardian: string;
  traveltime: number;
  studytime: number;
  failures: number;
  schoolsup: string;
  famsup: string;
  paid: string;
  activities: string;
  nursery: string;
  higher: string;
  internet: string;
  romantic: string;
  famrel: number;
  freetime: number;
  goout: number;
  Dalc: number;
  Walc: number;
  health: number;
  absences: number;
  G1?: number;
  G2?: number;
}

export interface PredictionResult {
  mode: string;
  model_used: string;
  model_test_metrics: ModelMetric;
  predicted_grade: number;
  raw_grade: number;
  scale: string;
  support_indicator: {
    level: string;
    badge: 'critical' | 'warning' | 'safe';
    rule_explanation: string;
    thresholds: {
      high_risk_below: number;
      moderate_risk_below: number;
    };
  };
  influencing_factors: string[];
  disclaimer: string;
}

export interface BatchPredictionRow {
  row_index: number;
  student_id?: string;
  predicted_grade?: number;
  support_level?: string;
  support_badge?: 'critical' | 'warning' | 'safe';
  status: 'SUCCESS' | 'ERROR';
  error_message?: string;
  influencing_factors: string[];
}

export interface BatchPredictionResponse {
  mode: string;
  model_used: string;
  total_rows: number;
  valid_rows_count: number;
  error_rows_count: number;
  mean_predicted_grade: number | null;
  risk_distribution: { [level: string]: number };
  results: BatchPredictionRow[];
}

export interface ClusterSummary {
  cluster_id: number;
  label: string;
  student_count: number;
  percentage: number;
  feature_averages: { [key: string]: number };
  descriptive_traits: string[];
}

export interface ClusteringResult {
  n_clusters: number;
  features_used: string[];
  pca_variance_explained: number[];
  total_variance_explained_pct: number;
  cluster_summaries: ClusterSummary[];
  data_points: {
    id: number;
    cluster: number;
    pca_x: number;
    pca_y: number;
    studytime: number;
    absences: number;
    g3?: number;
  }[];
}

export interface ExplainabilityData {
  mode: string;
  best_model_name: string;
  feature_importances: { feature: string; importance: number }[];
  permutation_importance: { feature: string; importance_mean: number; importance_std: number }[];
  predictions_sample: { actual: number; predicted: number; raw_predicted: number; residual: number }[];
  methodology_note: string;
}

export interface UniversalStudentRequest {
  student_name: string;
  institution_name: string;
  education_level: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  weekly_study_hours: number;
  attendance_percentage: number;
  previous_score_percent?: number;
  past_backlogs: number;
  has_internet: boolean;
  extra_coaching: boolean;
  aims_higher_studies: boolean;
  health_condition: 'Poor' | 'Average' | 'Good' | 'Excellent';
  social_freetime: 'Low' | 'Moderate' | 'High';
}

export interface UniversalPredictionResponse {
  student_name: string;
  institution_name: string;
  education_level: string;
  age: number;
  predicted_percentage: number;
  predicted_cgpa: number;
  predicted_grade_20: number;
  letter_grade: string;
  performance_summary: string;
  academic_risk: string;
  risk_badge: 'safe' | 'warning' | 'critical';
  pass_probability: number;
  model_used: string;
  personalized_tips: string[];
  strengths: string[];
  areas_for_improvement: string[];
}


