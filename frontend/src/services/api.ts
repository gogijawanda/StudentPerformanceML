import {
  DatasetOverview,
  RegressionMetricsResponse,
  ClassificationMetricsResponse,
  StudentInput,
  PredictionResult,
  BatchPredictionResponse,
  ClusteringResult,
  ExplainabilityData,
  UniversalStudentRequest,
  UniversalPredictionResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } else if (data.message) {
        errorMsg = data.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; models_trained: boolean; version: string }>(res);
  },

  // Overview
  getOverview: async () => {
    const res = await fetch(`${API_BASE}/overview`);
    return handleResponse<{
      status: string;
      dataset: DatasetOverview;
      models_trained: boolean;
      models_summary: RegressionMetricsResponse | null;
    }>(res);
  },

  // Dataset
  getDatasetSummary: async () => {
    const res = await fetch(`${API_BASE}/dataset/summary`);
    return handleResponse<{
      numerical_summary: any[];
      categorical_summary: any[];
      correlation_analysis: {
        features: string[];
        matrix: number[][];
        target_correlations: { feature: string; correlation: number }[];
      };
      total_rows: number;
      total_columns: number;
    }>(res);
  },

  getDatasetPreview: async (page = 1, pageSize = 15, search?: string) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/dataset/preview?${params.toString()}`);
    return handleResponse<{
      columns: { name: string; type: string; dtype: string; unique_values: number }[];
      total_records: number;
      page: number;
      page_size: number;
      total_pages: number;
      data: any[];
    }>(res);
  },

  getDatasetDownloadUrl: () => `${API_BASE}/dataset/download`,
  getTemplateDownloadUrl: (mode = 'early') => `${API_BASE}/dataset/template?mode=${mode}`,

  // Models
  getRegressionMetrics: async () => {
    const res = await fetch(`${API_BASE}/models/metrics`);
    return handleResponse<RegressionMetricsResponse>(res);
  },

  getClassificationMetrics: async () => {
    const res = await fetch(`${API_BASE}/models/classification-metrics`);
    return handleResponse<ClassificationMetricsResponse>(res);
  },

  trainModels: async (passThreshold = 10) => {
    const res = await fetch(`${API_BASE}/models/train?pass_threshold=${passThreshold}`, {
      method: 'POST'
    });
    return handleResponse<{
      status: string;
      message: string;
      best_early_regressor: string;
      best_assisted_regressor: string;
      best_early_classifier: string;
      best_assisted_classifier: string;
    }>(res);
  },

  // Universal Quick Predictor for any school/college student
  predictUniversal: async (payload: UniversalStudentRequest) => {
    const res = await fetch(`${API_BASE}/predict/universal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<UniversalPredictionResponse>(res);
  },

  // Predictions
  predictGrade: async (payload: {
    student: StudentInput;
    mode: 'early' | 'grade_assisted';
    model_name?: string;
    high_risk_threshold?: number;
    moderate_risk_threshold?: number;
  }) => {
    const res = await fetch(`${API_BASE}/predict/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<PredictionResult>(res);
  },

  predictClassification: async (payload: {
    student: StudentInput;
    mode: 'early' | 'grade_assisted';
    model_name?: string;
    pass_threshold?: number;
  }) => {
    const res = await fetch(`${API_BASE}/predict/classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<{
      mode: string;
      model_used: string;
      outcome: 'Pass' | 'Fail';
      label: number;
      probability_pass: number | null;
      pass_threshold: number;
      test_metrics: any;
      disclaimer: string;
    }>(res);
  },

  predictBatch: async (
    file: File,
    mode: 'early' | 'grade_assisted',
    modelName?: string,
    highRisk = 10,
    moderateRisk = 14
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    if (modelName) formData.append('model_name', modelName);
    formData.append('high_risk_threshold', highRisk.toString());
    formData.append('moderate_risk_threshold', moderateRisk.toString());

    const res = await fetch(`${API_BASE}/predict/batch`, {
      method: 'POST',
      body: formData
    });
    return handleResponse<BatchPredictionResponse>(res);
  },

  // Analysis
  getSegmentation: async (nClusters = 3) => {
    const res = await fetch(`${API_BASE}/analysis/segmentation?n_clusters=${nClusters}`);
    return handleResponse<ClusteringResult>(res);
  },

  getExplainability: async (mode = 'early') => {
    const res = await fetch(`${API_BASE}/analysis/explainability?mode=${mode}`);
    return handleResponse<ExplainabilityData>(res);
  },

  // Reports
  getModelComparisonCsvUrl: () => `${API_BASE}/reports/model-comparison`,
  getSummaryReportHtmlUrl: () => `${API_BASE}/reports/summary-report`
};

