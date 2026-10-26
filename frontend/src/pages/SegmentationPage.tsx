import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  PieChart as PieIcon,
  HelpCircle,
  TrendingUp,
  Cpu
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
  Cell
} from 'recharts';
import { api } from '../services/api';
import { ClusteringResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';

const CLUSTER_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const SegmentationPage: React.FC = () => {
  const [clusters, setClusters] = useState<ClusteringResult | null>(null);
  const [nClusters, setNClusters] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClusters = async (k: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getSegmentation(k);
      setClusters(res);
    } catch (err: any) {
      setError(err.message || 'Clustering failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters(nClusters);
  }, [nClusters]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Segmentation (K-Means & PCA)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unsupervised exploratory grouping on standardized demographic & behavioral attributes (target grade excluded)
          </p>
        </div>

        {/* Cluster count selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Clusters (K):</span>
          <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
            {[2, 3, 4, 5].map((k) => (
              <button
                key={k}
                onClick={() => setNClusters(k)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  nClusters === k ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                K = {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Alert type="info" title="Exploratory Clustering Scope">
        Clusters discover underlying multidimensional patterns in attendance, study habits, and home environments without target grade guidance. Segments must not be used to label or penalize students.
      </Alert>

      {loading ? (
        <LoadingSpinner message={`Computing K-Means clustering and PCA projections for K=${nClusters}...`} />
      ) : error || !clusters ? (
        <Alert type="error">{error || 'Clustering unavailable'}</Alert>
      ) : (
        <div className="space-y-8">
          {/* Cluster Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {clusters.cluster_summaries.map((summary) => (
              <div
                key={summary.cluster_id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: CLUSTER_COLORS[summary.cluster_id % CLUSTER_COLORS.length] }}
                    />
                    <h3 className="font-bold text-slate-900 text-sm">{summary.label}</h3>
                  </div>
                  <Badge variant="neutral">
                    {summary.student_count} students ({summary.percentage}%)
                  </Badge>
                </div>

                {/* Key feature averages */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] font-sans text-slate-500 block">Weekly Study Time</span>
                    <strong>{summary.feature_averages.studytime} / 4</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-500 block">Mean Absences</span>
                    <strong>{summary.feature_averages.absences} days</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-500 block">Mean Past Failures</span>
                    <strong>{summary.feature_averages.failures}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-500 block">Mean Final Grade (G3)</span>
                    <strong className="text-blue-600">{summary.feature_averages.G3} / 20</strong>
                  </div>
                </div>

                {/* Descriptive traits */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Observed Traits
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {summary.descriptive_traits.map((t, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-blue-500">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* PCA 2D Scatter Projection */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Principal Component Analysis (PCA) 2D Projection
                </h3>
                <p className="text-xs text-slate-500">
                  Total explained variance in 2 components: {clusters.total_variance_explained_pct}% (PC1: {clusters.pca_variance_explained[0]}%, PC2: {clusters.pca_variance_explained[1]}%)
                </p>
              </div>
              <Cpu size={18} className="text-slate-400" />
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="pca_x"
                    name="Principal Component 1"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Principal Component 1 (Primary Behavioral Variance)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="pca_y"
                    name="Principal Component 2"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    formatter={(val, name, item: any) => [
                      `Cluster ${item.payload.cluster + 1} (Studytime: ${item.payload.studytime}, Absences: ${item.payload.absences}, G3: ${item.payload.g3})`,
                      'Segment'
                    ]}
                  />
                  {clusters.cluster_summaries.map((s) => {
                    const clusterPoints = clusters.data_points.filter((p) => p.cluster === s.cluster_id);
                    return (
                      <Scatter
                        key={s.cluster_id}
                        name={s.label}
                        data={clusterPoints}
                        fill={CLUSTER_COLORS[s.cluster_id % CLUSTER_COLORS.length]}
                        opacity={0.75}
                      />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

