import React from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const vivaQuestions = [
    {
      q: '1. What is the fundamental problem being addressed in this MCA project?',
      a: 'The Smart Academic Intelligence System (SAIS) addresses early identification of at-risk students before final evaluations occur. By distinguishing early behavioral predictions (without exam marks) from mid-term grade-assisted predictions, academic institutions can implement timely pedagogical interventions rather than reactive assessments.'
    },
    {
      q: '2. Why did you implement two separate modes (Early vs. Grade-Assisted)?',
      a: 'To prevent data leakage. Period 1 (G1) and Period 2 (G2) grades correlate extremely strongly with final G3 (r = 0.80 and 0.90). Including them at the start of a semester would represent test leakage because those grades do not exist yet. Mode 1 evaluates true early intervention capability, while Mode 2 evaluates mid-semester trajectory reinforcement.'
    },
    {
      q: '3. What preprocessing pipeline steps were implemented to avoid data leakage?',
      a: 'We separated the dataset into train (80%) and test (20%) splits using a fixed random seed (42). Feature transformers (SimpleImputer, StandardScaler, and OneHotEncoder) were fitted strictly on training data only, and then applied to transform test and runtime inference records.'
    },
    {
      q: '4. Why is the R² score lower in Early Prediction (~0.28) compared to Grade-Assisted (~0.81)?',
      a: 'This reflects genuine educational reality: human academic performance is influenced by numerous unquantified subjective factors (motivation, emotional state, teaching quality). Behavioral indicators alone explain ~28% of final variance. Once actual examination benchmarks (G1, G2) become available, explained variance jumps to ~81%.'
    },
    {
      q: '5. How does the system handle students predicted with negative or >20 grades?',
      a: 'Linear and tree models can occasionally output raw numbers slightly outside [0, 20]. The system documents the raw score honestly and applies standard pedagogical bounds [0, 20] for user display, while noting that clipping does not alter raw model loss.'
    },
    {
      q: '6. What algorithms were evaluated and how were they selected?',
      a: 'For regression: Linear Regression (baseline), Decision Tree Regressor, Random Forest Regressor, and Gradient Boosting Regressor. For classification: Logistic Regression, Decision Tree Classifier, and Random Forest Classifier. Best models are chosen based on held-out test R² and F1-score respectively.'
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Viva Voce Technical Documentation</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic deliverables, system architecture, downloadable reports, and MCA project defense resources
        </p>
      </div>

      {/* Exportable Technical Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <FileText size={20} />
            <h3 className="font-bold text-slate-900 text-sm">Full Technical Report</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Clean, printable HTML summary containing all verified empirical metrics, distributions, and methodology.
          </p>
          <a
            href={api.getSummaryReportHtmlUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            <span>Open Printable Report</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <Download size={20} />
            <h3 className="font-bold text-slate-900 text-sm">Model Benchmarks CSV</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Downloadable CSV matrix of MAE, RMSE, R², Accuracy, and F1 across all evaluated algorithms.
          </p>
          <a
            href={api.getModelComparisonCsvUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Export Comparison CSV</span>
            <Download size={12} />
          </a>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <BookOpen size={20} />
            <h3 className="font-bold text-slate-900 text-sm">Dataset Artifacts</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Official UCI mathematics dataset (395 records) used as ground truth for model validation.
          </p>
          <a
            href={api.getDatasetDownloadUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Download Dataset CSV</span>
            <Download size={12} />
          </a>
        </div>
      </div>

      {/* System Architecture Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">System & ML Pipeline Architecture</h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{`+---------------------------------------------------------------------------------+
|                                SAIS ARCHITECTURE                                |
+---------------------------------------------------------------------------------+

  [ React 18 + Vite + TypeScript Frontend (Tailwind CSS, Recharts, Lucide Icons) ]
                                          |
                                    HTTP / JSON
                                          v
      [ FastAPI Backend (Python 3.13) + Uvicorn ASGI Server (Port 8000) ]
        |                   |                    |                    |
        v                   v                    v                    v
  [ API Routes ]    [ Pydantic Schemas ]  [ Pipeline Manager ]  [ Services ]
  - /overview       - StudentInput        - Training / Cache    - Report Gen
  - /dataset        - PredictionRequest   - Serialization       - CSV Exporter
  - /models         - BatchSchemas        - Inference Engine
  - /predict
  - /analysis
        |
        +---> [ Scikit-Learn Machine Learning Core ]
                |
                +---> Preprocessor (ColumnTransformer, StandardScaler, OneHotEncoder)
                +---> Regression: LinReg, DecisionTree, RandomForest, GradBoost
                +---> Classification: LogisticRegression, DecisionTree, RandomForest
                +---> Clustering: K-Means (K=2..6) + 2D PCA Projections
                +---> Explainability: Gini Importance, Permutation Importance
                |
                +---> Source of Truth: data/student-mat.csv (UCI Math Dataset)
                +---> Persisted Model Artifacts: models/sais_artifacts.joblib`}</pre>
        </div>
      </div>

      {/* Viva Voce Questions & Answers */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <GraduationCap size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Viva Voce Preparation (Technical Q&A)</h3>
        </div>

        <div className="space-y-4 pt-1">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">{item.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

