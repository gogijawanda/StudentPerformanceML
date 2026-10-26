import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Award,
  Layers,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { api } from '../services/api';
import { RegressionMetricsResponse, RegressionModelItem } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';

export const ModelLabPage: React.FC = () => {
  const [metrics, setMetrics] = useState<RegressionMetricsResponse | null>(null);
  const [mode, setMode] = useState<'early' | 'grade_assisted'>('early');
  const [selectedModelName, setSelectedModelName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRegressionMetrics();
      setMetrics(res);
      // default selected model to best model of current mode
      if (res[mode]) {
        setSelectedModelName(res[mode].best_model_name);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load model metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (metrics && metrics[mode]) {
      setSelectedModelName(metrics[mode].best_model_name);
    }
  }, [mode, metrics]);

  if (loading) return <LoadingSpinner message="Evaluating regression models on held-out test split..." />;
  if (error || !metrics) return <div className="p-8"><Alert type="error">{error || 'Metrics unavailable'}</Alert></div>;

  const currentModeData = metrics[mode];
  const selectedModel = currentModeData?.models.find((m) => m.name === selectedModelName) || currentModeData?.models[0];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">ML Model Laboratory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical benchmark of 4 regression algorithms on held-out test cohort (N=79, Seed=42)
          </p>
        </div>

        {/* Mode Selector Pill */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setMode('early')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'early'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 1: Early (Excl. G1/G2)
          </button>
          <button
            onClick={() => setMode('grade_assisted')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'grade_assisted'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 2: Grade-Assisted (Incl. G1/G2)
          </button>
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
        mode === 'early' ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}>
        <strong>{mode === 'early' ? 'Early Prediction Pipeline:' : 'Grade-Assisted Pipeline:'}</strong>{' '}
        {mode === 'early'
          ? 'Utilizes only demographic and behavioral features (family background, study time, absences, past failures). Period exam grades G1 and G2 are strictly excluded to avoid data leakage during early-term intervention.'
          : 'Includes interim period grades G1 and G2 alongside behavioral predictors. This mirrors mid-term academic counseling where prior exam marks are known.'}
      </div>

      {/* Model Benchmark Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Algorithm Benchmark Comparison
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Best Algorithm:{' '}
            <strong className="text-slate-900">{currentModeData.best_model_name}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Algorithm</th>
                <th className="p-3.5">MAE (Mean Absolute Error)</th>
                <th className="p-3.5">RMSE (Root Mean Squared)</th>
                <th className="p-3.5">MSE</th>
                <th className="p-3.5">R² Score (Variance Explained)</th>
                <th className="p-3.5">Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {currentModeData.models.map((model) => {
                const isSelected = model.name === selectedModelName;
                return (
                  <tr
                    key={model.name}
                    onClick={() => setSelectedModelName(model.name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3.5 font-sans font-medium flex items-center gap-2 text-slate-900">
                      <span>{model.name}</span>
                      {model.is_best && (
                        <Badge variant="safe" className="font-sans text-[10px] py-0 px-1.5">
                          Best Model
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5">{model.metrics.mae.toFixed(3)}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{model.metrics.rmse.toFixed(3)}</td>
                    <td className="p-3.5 text-slate-500">{model.metrics.mse.toFixed(3)}</td>
                    <td className="p-3.5 font-bold" style={{ color: model.metrics.r2 > 0.5 ? '#059669' : model.metrics.r2 > 0 ? '#2563eb' : '#dc2626' }}>
                      {model.metrics.r2.toFixed(3)}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'
                      }`}>
                        {isSelected ? 'Active View' : 'Inspect'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Deep Dive: Scatter & Residuals */}
      {selectedModel && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Diagnostics: {selectedModel.name}
              </h3>
              <p className="text-xs text-slate-500">
                Performance plots on the 79 held-out student test records
              </p>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <span>MAE: <strong>{selectedModel.metrics.mae}</strong></span>
              <span>RMSE: <strong>{selectedModel.metrics.rmse}</strong></span>
              <span>R²: <strong className="text-blue-600">{selectedModel.metrics.r2}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actual vs Predicted Scatter */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Actual vs. Predicted Final Grade (0-20)</h4>
                  <p className="text-[11px] text-slate-500">Diagonal reference represents ideal 1:1 prediction</p>
                </div>
                <TrendingUp size={16} className="text-slate-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="actual"
                      name="Actual Grade"
                      domain={[0, 20]}
                      unit="/20"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Actual Grade', position: 'insideBottom', offset: -10, fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="predicted"
                      name="Predicted Grade"
                      domain={[0, 20]}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 20, y: 20 }]} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Scatter
                      data={selectedModel.predictions_sample || []}
                      fill="#2563eb"
                      opacity={0.8}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Residual Plot */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Residual Distribution (Actual - Predicted)</h4>
                  <p className="text-[11px] text-slate-500">Zero line represents perfect prediction; spread shows residual error</p>
                </div>
                <BarChart3 size={16} className="text-slate-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="actual"
                      name="Actual Grade"
                      domain={[0, 20]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Actual Grade', position: 'insideBottom', offset: -10, fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="residual"
                      name="Residual Error"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3 3" />
                    <Scatter
                      data={selectedModel.predictions_sample || []}
                      fill="#f97316"
                      opacity={0.8}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Feature Importance (if supported by tree/linear model) */}
          {selectedModel.feature_importances && selectedModel.feature_importances.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                Top Empirical Feature Importances ({selectedModel.name})
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Relative contribution to variance reduction during model fitting
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedModel.feature_importances}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

