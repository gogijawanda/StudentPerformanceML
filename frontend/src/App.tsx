import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickPredictorPage } from './pages/QuickPredictorPage';
import { OverviewPage } from './pages/OverviewPage';
import { DatasetPage } from './pages/DatasetPage';
import { ModelLabPage } from './pages/ModelLabPage';
import { GradePredictionPage } from './pages/GradePredictionPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ClassificationPage } from './pages/ClassificationPage';
import { SegmentationPage } from './pages/SegmentationPage';
import { BatchPredictionPage } from './pages/BatchPredictionPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { ReportsPage } from './pages/ReportsPage';

const PAGE_META: { [key: string]: { title: string; subtitle: string } } = {
  quick_predict: {
    title: 'Quick Student Predictor (Universal)',
    subtitle: 'Simple Percentage (%), CGPA (0–10) & Letter Grade Forecasting for Any School or College Student'
  },
  overview: {
    title: 'Overview Dashboard',
    subtitle: 'UCI Mathematics Cohort Analytics & Real-Time Performance Benchmarks'
  },
  dataset: {
    title: 'Dataset Explorer',
    subtitle: 'Searchable Cohort Records, Distributions & Pearson Target Correlations'
  },
  predict: {
    title: 'Advanced 0–20 Grade Predictor',
    subtitle: 'Classic 0–20 Scale Academic Predictor with Early vs. Grade-Assisted Regimes'
  },
  risk: {
    title: 'Academic Risk Analysis',
    subtitle: 'Threshold-Driven Academic Support Indexing & Institutional Decision Rules'
  },
  classification: {
    title: 'Pass / Fail Classification Pipeline',
    subtitle: 'Binary Academic Outcome Modeling & Confusion Matrix Diagnostics'
  },
  models: {
    title: 'ML Model Laboratory',
    subtitle: 'Comparative Evaluation Across 4 Regression Algorithms & 2 Prediction Modes'
  },
  segmentation: {
    title: 'Student Segmentation (K-Means & PCA)',
    subtitle: 'Unsupervised Behavioral Clustering with 2D PCA Projections'
  },
  batch: {
    title: 'Batch CSV Prediction',
    subtitle: 'Multi-Student CSV Ingestion, Validation & Cohort Risk Profiling'
  },
  explainability: {
    title: 'Model Explainability & Feature Attribution',
    subtitle: 'Feature Importance, Test Permutation Attribution & Residual Diagnostics'
  },
  reports: {
    title: 'Reports & Viva Voce Technical Documentation',
    subtitle: 'Deliverables, Full Architecture, and Viva Voce Academic Defense Prep'
  }
};

export const App: React.FC = () => {
  // Default to the friendly Quick Predictor page for instant usability!
  const [currentTab, setCurrentTab] = useState<string>('quick_predict');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const meta = PAGE_META[currentTab] || PAGE_META.quick_predict;

  const handleRetrained = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onModelRetrained={handleRetrained}
        />

        <main className="flex-1 pb-16" key={refreshKey}>
          {currentTab === 'quick_predict' && <QuickPredictorPage />}
          {currentTab === 'overview' && <OverviewPage onNavigate={setCurrentTab} />}
          {currentTab === 'dataset' && <DatasetPage />}
          {currentTab === 'models' && <ModelLabPage />}
          {currentTab === 'predict' && <GradePredictionPage />}
          {currentTab === 'risk' && <RiskAnalysisPage />}
          {currentTab === 'classification' && <ClassificationPage />}
          {currentTab === 'segmentation' && <SegmentationPage />}
          {currentTab === 'batch' && <BatchPredictionPage />}
          {currentTab === 'explainability' && <ExplainabilityPage />}
          {currentTab === 'reports' && <ReportsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
