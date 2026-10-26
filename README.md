# Smart Academic Intelligence System (SAIS)
### Machine Learning-Based Student Performance Prediction, Academic Risk Analysis, and Intelligent Analytics

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5+-F7931E.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic-green.svg)]()

An MCA Capstone Project demonstrating real machine learning pipelines, explainable AI, exploratory unsupervised segmentation, transparent rule-based academic risk indicators, and responsive analytics.

---

## 1. Project Abstract & Universal Usability

Educational institutions frequently struggle with identifying at-risk students before final semester examinations take place. The **Smart Academic Intelligence System (SAIS)** is a full-stack, locally runnable academic analytics platform designed to model, predict, and analyze student performance for **any student — from school (Class 6–12) to college and university degrees (B.Tech, BCA, MCA, MBA, etc.) across any age group (10 to 60+)**.

### 🌟 Brand New: Quick Universal Predictor
To make the application simple, human-friendly, and accessible to anyone without machine learning expertise, SAIS now includes a dedicated **Universal Quick Predictor**:
- **Any Age Group:** Predicts for middle schoolers (age 10+), high schoolers (15–18), college undergrads (18–24), or adult/postgraduate learners (25–60+).
- **Any School or College:** Enter any school, college, polytechnic, or university name.
- **Familiar Indian & Global Grading Formats:** Automatically outputs performance in:
  1. **Percentage (%)** (e.g. `78.5%`)
  2. **10-Point CGPA** (e.g. `7.85 / 10.0`)
  3. **Letter Grade** (e.g. `A (Excellent)`)
  4. **Original European Scale** (`15.7 / 20`) for research reference
- **1-Click Demo Profiles:** Test instantly with 1 tap using pre-configured profiles (*College Student, High Schooler, At-Risk Student, or Top Ranker*).
- **Actionable Advice Plan:** Generates personalized study tips, strengths, and improvement areas.
- **Printable Student Report Card:** Print or save as PDF with a single click. 

Unlike trivial mockups, SAIS operates two distinct, empirically validated machine learning regimes:
1. **Mode 1: Early Prediction (Excluding Exam Period Grades G1 and G2):** Utilizes purely demographic and behavioral indicators to detect students needing intervention at the semester's onset.
2. **Mode 2: Grade-Assisted Prediction (Including G1 and G2):** Incorporates interim continuous evaluation marks to provide high-precision final grade forecasts and trajectory reinforcement.

SAIS integrates **four regression models** (Linear Regression, Decision Tree, Random Forest, and Gradient Boosting), **three classification pipelines** (Logistic Regression, Decision Tree, Random Forest), **unsupervised K-Means clustering** with 2D Principal Component Analysis (PCA), and **Gini/Permutation feature importance** for transparent interpretability.

---

## 2. Problem Statement

Traditional academic grading systems are reactive: student deficiencies are primarily identified after final examinations conclude, when remediation options are limited. Furthermore, naive machine learning attempts often suffer from:
- **Target Leakage:** Using interim exam grades to predict final performance early in the semester when such grades do not yet exist.
- **Black-Box Opacity:** Presenting raw numbers without explaining which behavioral attributes contributed to the outcome.
- **Deterministic Stigmatization:** Wrongly presenting probabilistic risk estimates as permanent judgments on a student's intellect.

SAIS solves these challenges through transparent multi-pipeline architecture, configurable support thresholds, and strict train/test data isolation.

---

## 3. Dataset Description

The application uses the official **UCI Machine Learning Repository Student Performance Dataset** (Mathematics course: `data/student-mat.csv`):
- **Cohort Size:** 395 student records.
- **Attributes:** 33 features (17 categorical, 16 numerical).
- **Format:** Semicolon-delimited (`;`), UTF-8.
- **Missing Values:** 0 missing entries across all rows.
- **Target Variable:** `G3` — final mathematics grade on a 0 to 20 scale.
  - Mean final grade: `10.42 / 20`
  - Median final grade: `11.0 / 20`
  - Standard deviation: `4.58`
  - Passing threshold (European/Portuguese standard): `G3 >= 10`

---

## 4. Empirical Machine Learning Benchmarks

All models were evaluated on an identical **80% train (316 students) / 20% test (79 students)** split using a fixed random seed (`random_state=42`). Preprocessing transformers (`StandardScaler`, `OneHotEncoder`, `SimpleImputer`) were fitted strictly on training data to prevent data leakage.

### Regression Benchmarks (Predicting Final Grade G3: 0–20)

| Mode | Algorithm | MAE | RMSE | R² Score | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Early Prediction** (Excl. G1, G2) | Linear Regression | 3.395 | 4.196 | 0.141 | Baseline |
| | Decision Tree Regressor | 3.586 | 4.613 | -0.038 | Overfit on tree splits |
| | **Random Forest Regressor** | **3.065** | **3.837** | **0.282** | **Best Early Regressor** |
| | Gradient Boosting Regressor | 3.089 | 3.901 | 0.258 | Strong alternative |
| **Grade-Assisted** (Incl. G1, G2) | Linear Regression | 1.647 | 2.378 | 0.724 | Strong linear fit |
| | Decision Tree Regressor | 1.172 | 2.112 | 0.782 | Solid pruning |
| | Random Forest Regressor | 1.194 | 2.002 | 0.804 | High consistency |
| | **Gradient Boosting Regressor** | **1.125** | **1.948** | **0.815** | **Best Assisted Regressor** |

> **Key Pedagogical Finding:** In Early Prediction mode, behavioral and home variables alone explain **~28.2% of the variance** in final performance (MAE = 3.06). When continuous assessment marks (G1, G2) become available, the explained variance increases to **81.5%** (MAE = 1.12), confirming that interim academic feedback is the single strongest indicator of final achievement.

### Pass/Fail Classification Benchmarks (Threshold G3 >= 10)

| Mode | Classifier | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Early** | Logistic Regression | 65.8% | 0.698 | 0.836 | 0.761 | 0.589 |
| | **Decision Tree Classifier** | **67.1%** | **0.709** | **0.865** | **0.780** | **0.623** |
| | Random Forest Classifier | 63.3% | 0.686 | 0.885 | 0.772 | 0.646 |
| **Grade-Assisted** | Logistic Regression | 87.3% | 0.902 | 0.898 | 0.900 | 0.949 |
| | **Decision Tree Classifier** | **88.6%** | **0.904** | **0.914** | **0.909** | **0.910** |
| | Random Forest Classifier | 87.3% | 0.902 | 0.902 | 0.902 | 0.932 |

---

## 5. System Architecture

```
+---------------------------------------------------------------------------------+
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
                +---> Persisted Model Artifacts: models/sais_artifacts.joblib
```

---

## 6. Project Structure

```
StudentPerformanceML/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry & CORS
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py            # Paths, constants, features, schemas
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── student.py           # Pydantic input models & range validation
│   │   │   └── prediction.py        # Prediction & batch schemas
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── dataset.py           # Safe CSV loading, EDA, statistics
│   │   │   ├── preprocessing.py     # ColumnTransformer, StandardScaler, OneHotEncoder
│   │   │   ├── regression.py        # 4 regression pipelines & test evaluation
│   │   │   ├── classification.py    # 3 classification models & confusion matrix
│   │   │   ├── clustering.py        # K-Means clustering & PCA 2D projections
│   │   │   ├── explainability.py    # Permutation importance & Gini importances
│   │   │   └── pipeline_manager.py  # Central manager, caching, inference
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── routes_overview.py   # /api/overview
│   │       ├── routes_dataset.py    # /api/dataset/summary, preview, templates
│   │       ├── routes_models.py     # /api/models/metrics, /api/models/train
│   │       ├── routes_predict.py    # /api/predict/grade, batch, classification
│   │       ├── routes_analysis.py   # /api/analysis/segmentation, explainability
│   │       └── routes_reports.py    # /api/reports/model-comparison, summary-report
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_dataset_and_ml.py   # 8 unit tests: leakage, data integrity, ML
│   │   └── test_api_endpoints.py    # 10 integration tests for API endpoints
│   ├── train.py                     # Standalone CLI training script
│   └── requirements.txt             # Pinned backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/              # Sidebar, Header, StatCard, Badge, Alert, Spinner
│   │   ├── pages/                   # 10 pages (Overview, Dataset, Models, Predict, etc.)
│   │   ├── services/                # api.ts (Centralized API client)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── tests/                   # Vitest unit test suite
│   │   ├── App.tsx                  # Root navigation & state
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Tailwind base styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── data/
│   ├── student-mat.csv              # UCI Mathematics dataset (Source of truth)
│   └── student-por.csv              # UCI Portuguese dataset
├── models/
│   └── sais_artifacts.joblib        # Persisted scikit-learn models & metrics
├── .gitignore
└── README.md
```

---

## 7. Windows-Friendly Setup and Execution Guide

### One-Click Launch (Recommended for Daily Use)
After the initial setup, you do **not** need to re-install packages, re-train models, or run tests every time! Simply double-click:
👉 **`start.bat`** in the project folder (or run `.\start.bat` / `.\start.ps1`).

This automatically starts both the FastAPI backend and the React frontend in separate windows and makes the app immediately available at **`http://localhost:5173`**.

---

### Prerequisites (One-Time Setup Only)

---

### Step 1: Clone or Open the Workspace
```powershell
cd D:\MlProject\StudentPerformanceML
```

### Step 2: Install Backend Dependencies
```powershell
python -m pip install -r backend/requirements.txt
```

### Step 3: Run Model Training & Evaluation (Creates Artifacts)
```powershell
python backend/train.py
```
This trains all 4 regression models, 3 classification models, K-Means clustering, and permutation importances, saving `models/sais_artifacts.joblib`.

### Step 4: Run Backend Tests
```powershell
python -m pytest backend/tests -v
```
*(All 18 tests will execute and pass)*.

### Step 5: Start the FastAPI Backend Server
```powershell
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### Step 6: Install Frontend Dependencies & Start React App
In a second terminal:
```powershell
cd frontend
cmd.exe /c "npm install"
cmd.exe /c "npm run dev"
```
The React development server will start at:
👉 **`http://localhost:5173`**

### Step 7: Run Frontend Unit Tests
```powershell
cd frontend
cmd.exe /c "npm test"
```

---

## 8. Detailed API Endpoints Contract

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root status and API documentation link |
| `GET` | `/api/health` | Backend health check and model training verification |
| `GET` | `/api/overview` | Loaded dataset empirical metrics and model status |
| `GET` | `/api/dataset/summary` | Numerical statistics, frequencies, and target correlations |
| `GET` | `/api/dataset/preview` | Searchable, paginated student dataset preview |
| `GET` | `/api/dataset/download` | Export raw mathematics cohort as CSV |
| `GET` | `/api/dataset/template` | Download CSV template for batch prediction (Early / Assisted) |
| `GET` | `/api/models/metrics` | Held-out test metrics and samples for 4 regression algorithms |
| `GET` | `/api/models/classification-metrics` | Accuracy, Precision, Recall, F1, and Confusion Matrices |
| `POST` | `/api/models/train` | On-demand retraining and artifact serialization |
| `POST` | `/api/predict/grade` | Single student grade prediction (0–20) and risk indexing |
| `POST` | `/api/predict/classification` | Single student binary Pass/Fail inference with probability |
| `POST` | `/api/predict/batch` | Upload CSV for batch prediction, row validation, and error reporting |
| `GET` | `/api/analysis/segmentation` | K-Means clustering with 2D PCA projections and cluster profiles |
| `GET` | `/api/analysis/explainability` | Feature importance and permutation attribution diagnostics |
| `GET` | `/api/reports/model-comparison` | Export model metrics as a downloadable CSV |
| `GET` | `/api/reports/summary-report` | Full printable HTML analytical technical report |

---

## 9. Viva Voce Q&A (MCA Defense Preparation)

**Q1: How does your system prevent target leakage?**
> In Early Prediction mode, interim grades `G1` and `G2` are strictly excluded from the feature matrix `X`. The target `G3` is never present in `X`. Furthermore, scikit-learn transformers (`StandardScaler`, `OneHotEncoder`) are fitted on the training split only and applied to transform test records.

**Q2: Why does Random Forest outperform Linear Regression in Early Mode?**
> The relationship between demographic indicators (such as parental education, absences, and study time) and academic success is non-linear and exhibits multi-feature interactions. Random Forest captures threshold effects (e.g. absences below 4 do not hurt performance, but absences above 15 cause sharp declines) which a standard hyperplane cannot model.

**Q3: How are invalid rows handled in batch prediction?**
> Rather than crashing the entire batch upload, SAIS uses row-by-row schema validation against defined categorical sets and numerical ranges. Valid rows receive predictions and risk badges, while invalid rows are flagged with explicit error diagnostics.

**Q4: What is the purpose of K-Means clustering if we already have grades?**
> Clustering is performed on behavioral and demographic attributes with the target grade excluded. This enables unsupervised discovery of student profiles (e.g. high-effort low-attendance vs. low-effort high-social) independently of grades, allowing proactive counseling tailored to specific student archetypes.

---

## 10. Ethical Considerations & Limitations

1. **Advisory Nature:** Predictive machine learning models output statistical likelihoods, not deterministic human limits. Predictions should be used to support students, never to gatekeeper opportunities.
2. **Correlation vs. Causation:** High feature importance (e.g. absences or past failures) indicates predictive correlation within this dataset. It does not prove that modifying a single parameter will guarantee grade changes.
3. **Contextual Scope:** The dataset originates from two secondary schools in Portugal; while general principles apply broadly, performance models should be recalibrated when deployed in different cultural or institutional environments.

---

## 11. Authors & Academic Credits

- **Project:** Smart Academic Intelligence System (SAIS)
- **Degree:** Master of Computer Applications (MCA)
- **Dataset Source:** Cortez and Silva (2008), *Using Data Mining to Predict Secondary School Student Performance*, University of Minho, Portugal. Available at UCI Machine Learning Repository.

