import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Info,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { api } from '../services/api';
import { ExplainabilityData } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';

export const ExplainabilityPage: React.FC = () => {
  const [data, setData] = useState<ExplainabilityData | null>(null);
  const [mode, setMode] = useState<'early' | 'grade_assisted'>('early');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplainability = async (selectedMode: 'early' | 'grade_assisted') => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getExplainability(selectedMode);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load explainability diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplainability(mode);
  }, [mode]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Model Explainability & Diagnostics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interpretable model insights: tree feature importances, test permutation scoring, and error distributions
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setMode('early')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'early' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 1: Early Prediction
          </button>
          <button
            onClick={() => setMode('grade_assisted')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'grade_assisted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 2: Grade-Assisted
          </button>
        </div>
      </div>

      {/* Critical Scientific Note on Correlation vs Causation */}
      <Alert type="warning" title="Methodological Principle: Correlation ≠ Causation">
        Statistical feature importance identifies variables that reduced loss during model fitting on this specific dataset. A high importance score does <strong>not</strong> imply that modifying that variable alone will directly alter student performance.
      </Alert>

      {loading ? (
        <LoadingSpinner message="Calculating permutation importance & feature attribution..." />
      ) : error || !data ? (
        <Alert type="error">{error || 'Data unavailable'}</Alert>
      ) : (
        <div className="space-y-8">
          {/* Dual Charts: Tree Importance vs Permutation Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tree Feature Importance */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Gini / MDI Feature Importance ({data.best_model_name})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mean decrease in impurity across all split decision nodes
                  </p>
                </div>
                <BarChart2 size={18} className="text-blue-600" />
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.feature_importances.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Permutation Importance on Held-out Test Data */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Permutation Importance (Unseen Test Set)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Loss increase when feature column values are randomly shuffled
                  </p>
                </div>
                <BrainCircuit size={18} className="text-emerald-600" />
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.permutation_importance.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="importance_mean" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Analytical Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              <span>Analytical Synthesis for Academic Counseling</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-900 block font-semibold">1. Cumulative Past Failures</strong>
                <p>
                  Across both early and assisted models, the number of prior course failures remains the single most influential non-grade demographic feature.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-900 block font-semibold">2. Attendance Patterns</strong>
                <p>
                  School absences exhibit a non-linear relationship: low absence rates (&le; 4) reliably correlate with passing stability, while extreme absences (&gt; 15) indicate acute disengagement.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <strong className="text-slate-900 block font-semibold">3. Parental Education & Home Support</strong>
                <p>
                  Higher parental education (especially mother's education Medu) and internet access provide supportive scaffolding that reduces risk variance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

