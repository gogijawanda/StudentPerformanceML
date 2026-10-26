import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle,
  AlertOctagon,
  Award,
  BookOpen,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { DatasetOverview, RegressionMetricsResponse } from '../types';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#6366f1'];

interface OverviewPageProps {
  onNavigate: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DatasetOverview | null>(null);
  const [modelsSummary, setModelsSummary] = useState<RegressionMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOverview();
      setData(res.dataset);
      setModelsSummary(res.models_summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating empirical dataset indicators..." />;
  if (error || !data) {
    return (
      <div className="p-8">
        <Alert type="error" title="Backend Connection Notice">
          {error || 'Unable to load dataset metrics.'} Ensure the FastAPI backend server is active at{' '}
          <code className="bg-rose-100 px-1 rounded">http://127.0.0.1:8000</code>.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-sm border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
            System Dashboard
          </span>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">
            Smart Academic Intelligence System (SAIS)
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Machine learning platform analyzing student demographics, behavioral indicators, and academic risk
            factors for any school, college, or university student.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('quick_predict')}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-1.5"
          >
            <span>✨ Quick Predictor (Any Student)</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('models')}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-all"
          >
            Model Lab
          </button>
        </div>
      </div>

      {/* Simple Understanding Guide */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <strong className="font-bold text-blue-900 block text-sm">💡 Quick Guide for Easy Understanding</strong>
          <p className="text-blue-800 text-xs mt-0.5">
            <strong>Percentage (0–100%):</strong> Standard school/college exam score. &nbsp;|&nbsp;
            <strong>CGPA (0–10.0):</strong> Standard 10-point university grade scale. &nbsp;|&nbsp;
            <strong>0–20 Scale:</strong> Academic dataset ground-truth scale.
          </p>
        </div>
        <button
          onClick={() => onNavigate('quick_predict')}
          className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
        >
          Try Simple Predictor
        </button>
      </div>

      {/* Primary Empirical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Student Population"
          value={data.total_records}
          subtitle="Full UCI mathematics cohort"
          icon={Users}
          badge={{ text: 'Verified', variant: 'safe' }}
        />
        <StatCard
          title="Feature Count"
          value={data.total_features}
          subtitle="30 predictors + G1, G2, G3"
          icon={BookOpen}
        />
        <StatCard
          title="Mean Final Grade (G3)"
          value={`${data.mean_final_grade} / 20`}
          subtitle={`Median: ${data.median_final_grade} | Std: ${data.std_final_grade}`}
          icon={Award}
          badge={{
            text: data.mean_final_grade >= 10 ? 'Passing Avg' : 'At-Risk Avg',
            variant: data.mean_final_grade >= 10 ? 'safe' : 'warning'
          }}
        />
        <StatCard
          title="Missing Values"
          value={data.total_missing}
          subtitle={`${data.duplicate_count} duplicate records`}
          icon={CheckCircle}
          badge={{ text: 'Complete Data', variant: 'safe' }}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">G3 Final Mathematics Grade Distribution</h3>
              <p className="text-xs text-slate-500">Distribution across 5 standardized performance tiers</p>
            </div>
            <BarChart3 size={18} className="text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.grade_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weekly Study Time Distribution</h3>
              <p className="text-xs text-slate-500">Self-reported weekly mathematics study hours</p>
            </div>
            <Calendar size={18} className="text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.study_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time_bracket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="students" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure vs Grade Impact & Active ML Models Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Past Failures Impact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Impact of Past Course Failures</h3>
          <p className="text-xs text-slate-500 mb-4">Strong negative correlation with final math grade</p>
          <div className="space-y-3">
            {data.failure_impact.map((item) => (
              <div key={item.failures} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-semibold text-xs text-slate-800">
                    {item.failures === 0 ? 'No Past Failures' : `${item.failures} Past Failure${item.failures > 1 ? 's' : ''}`}
                  </span>
                  <p className="text-[11px] text-slate-500">{item.student_count} students ({Math.round((item.student_count / 395) * 100)}%)</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${item.mean_grade >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.mean_grade} / 20
                  </span>
                  <p className="text-[10px] text-slate-400">Mean Grade</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Lab Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Active Model Laboratory Benchmarks</h3>
                <p className="text-xs text-slate-500">Evaluated on identical 20% held-out test split (79 students)</p>
              </div>
              <button
                onClick={() => onNavigate('models')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Comparison</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {modelsSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-900">Mode 1: Early Prediction</span>
                    <span className="text-[10px] bg-blue-200 text-blue-800 font-bold px-1.5 py-0.5 rounded">Excl. G1, G2</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {modelsSummary.early.best_model_name}
                  </p>
                  {(() => {
                    const best = modelsSummary.early.models.find(m => m.is_best);
                    return best ? (
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-100 text-center">
                        <div><div className="text-xs font-bold text-slate-900">{best.metrics.mae}</div><div className="text-[10px] text-slate-500">MAE</div></div>
                        <div><div className="text-xs font-bold text-slate-900">{best.metrics.rmse}</div><div className="text-[10px] text-slate-500">RMSE</div></div>
                        <div><div className="text-xs font-bold text-blue-600 font-mono">{best.metrics.r2}</div><div className="text-[10px] text-slate-500">R² Score</div></div>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900">Mode 2: Grade-Assisted</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Incl. G1, G2</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {modelsSummary.grade_assisted.best_model_name}
                  </p>
                  {(() => {
                    const best = modelsSummary.grade_assisted.models.find(m => m.is_best);
                    return best ? (
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-100 text-center">
                        <div><div className="text-xs font-bold text-slate-900">{best.metrics.mae}</div><div className="text-[10px] text-slate-500">MAE</div></div>
                        <div><div className="text-xs font-bold text-slate-900">{best.metrics.rmse}</div><div className="text-[10px] text-slate-500">RMSE</div></div>
                        <div><div className="text-xs font-bold text-emerald-600 font-mono">{best.metrics.r2}</div><div className="text-[10px] text-slate-500">R² Score</div></div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Models not loaded yet.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluation Protocol: 80% Train (316) / 20% Test (79) | Fixed Seed: 42</span>
            <span className="text-slate-400">Strictly no test-set data leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

