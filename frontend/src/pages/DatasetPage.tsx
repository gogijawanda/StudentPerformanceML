import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart2,
  Table as TableIcon
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';

export const DatasetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'numerical' | 'correlations'>('preview');
  const [previewData, setPreviewData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async (pageNum: number, query?: string) => {
    try {
      const res = await api.getDatasetPreview(pageNum, 15, query);
      setPreviewData(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.getDatasetSummary();
      setSummaryData(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPreview(page, search), fetchSummary()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchPreview(1, val);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPreview(newPage, search);
  };

  if (loading) return <LoadingSpinner message="Loading dataset records & statistical summaries..." />;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dataset Explorer</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            UCI Student Performance Mathematics cohort (395 observations, 33 attributes)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getDatasetDownloadUrl()}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Download CSV</span>
          </a>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <TableIcon size={16} />
          <span>Student Records Preview</span>
        </button>
        <button
          onClick={() => setActiveTab('numerical')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'numerical'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <Database size={16} />
          <span>Numerical Feature Statistics</span>
        </button>
        <button
          onClick={() => setActiveTab('correlations')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'correlations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <BarChart2 size={16} />
          <span>Target Correlations (with G3)</span>
        </button>
      </div>

      {/* Tab 1: Preview Table */}
      {activeTab === 'preview' && previewData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search across attributes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, previewData.total_records)} of{' '}
              {previewData.total_records} students
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">#</th>
                  <th className="p-3">School</th>
                  <th className="p-3">Sex</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Study Time</th>
                  <th className="p-3">Failures</th>
                  <th className="p-3">Absences</th>
                  <th className="p-3">Higher Ed</th>
                  <th className="p-3">Internet</th>
                  <th className="p-3">Health</th>
                  <th className="p-3">G1</th>
                  <th className="p-3">G2</th>
                  <th className="p-3 font-bold text-slate-900 bg-blue-50/80">G3 (Final)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {previewData.data.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-400 font-sans">{(page - 1) * 15 + i + 1}</td>
                    <td className="p-3 font-sans font-medium">{row.school}</td>
                    <td className="p-3 font-sans">{row.sex}</td>
                    <td className="p-3">{row.age}</td>
                    <td className="p-3">{row.studytime} ({row.studytime === 1 ? '<2h' : row.studytime === 2 ? '2-5h' : row.studytime === 3 ? '5-10h' : '>10h'})</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded font-sans font-semibold text-[10px] ${row.failures > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {row.failures}
                      </span>
                    </td>
                    <td className="p-3">{row.absences}</td>
                    <td className="p-3 font-sans">{row.higher}</td>
                    <td className="p-3 font-sans">{row.internet}</td>
                    <td className="p-3">{row.health} / 5</td>
                    <td className="p-3 font-semibold">{row.G1}</td>
                    <td className="p-3 font-semibold">{row.G2}</td>
                    <td className={`p-3 font-bold bg-blue-50/40 ${row.G3 >= 10 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {row.G3} / 20
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50/50">
            <span className="text-slate-500">
              Page {page} of {previewData.total_pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= previewData.total_pages}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Numerical Summary */}
      {activeTab === 'numerical' && summaryData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Numerical Feature Descriptive Statistics
            </h3>
            <span className="text-xs text-slate-500">Sample size: 395 students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold font-sans border-b border-slate-200">
                  <th className="p-3">Feature Name</th>
                  <th className="p-3">Mean</th>
                  <th className="p-3">Std Dev</th>
                  <th className="p-3">Min</th>
                  <th className="p-3">25% (Q1)</th>
                  <th className="p-3">Median (50%)</th>
                  <th className="p-3">75% (Q3)</th>
                  <th className="p-3">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {summaryData.numerical_summary.map((row: any) => (
                  <tr key={row.feature} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold font-sans text-slate-900">{row.feature}</td>
                    <td className="p-3">{row.mean}</td>
                    <td className="p-3 text-slate-500">{row.std}</td>
                    <td className="p-3">{row.min}</td>
                    <td className="p-3">{row.q25}</td>
                    <td className="p-3 font-semibold text-blue-600">{row.median}</td>
                    <td className="p-3">{row.q75}</td>
                    <td className="p-3">{row.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Correlations */}
      {activeTab === 'correlations' && summaryData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Pearson Correlation of Numerical Predictors with Final Grade (G3)
            </h3>
            <p className="text-xs text-slate-500">
              Ranked from strongest positive association to strongest negative association
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {summaryData.correlation_analysis.target_correlations.map((item: any) => {
              const isPositive = item.correlation >= 0;
              const absVal = Math.abs(item.correlation);
              const barWidth = Math.min(100, Math.round(absVal * 100));

              return (
                <div key={item.feature} className="flex items-center gap-4 text-xs">
                  <div className="w-28 font-medium font-sans text-slate-800">{item.feature}</div>
                  <div className="w-16 font-mono font-bold text-right" style={{ color: isPositive ? '#059669' : '#dc2626' }}>
                    {isPositive ? `+${item.correlation}` : item.correlation}
                  </div>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            <strong>Key Statistical Insight:</strong> Interim period grades (<code>G2</code> r=+0.90, <code>G1</code> r=+0.80) are the strongest linear predictors of final performance. Among non-grade features, previous class failures (<code>failures</code> r=-0.36) and mother's education (<code>Medu</code> r=+0.22) show the highest correlation.
          </div>
        </div>
      )}
    </div>
  );
};

