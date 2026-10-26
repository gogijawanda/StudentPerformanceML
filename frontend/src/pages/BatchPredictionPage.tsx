import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { BatchPredictionResponse, BatchPredictionRow } from '../types';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const BatchPredictionPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'early' | 'grade_assisted'>('early');
  const [result, setResult] = useState<BatchPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleProcessBatch = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictBatch(file, mode);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Batch prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResultsCsv = () => {
    if (!result) return;
    const headers = ['Row_Index', 'Student_ID', 'Status', 'Predicted_Grade', 'Support_Level', 'Error_Message'];
    const rows = result.results.map((r) => [
      r.row_index,
      r.student_id || `Student-${r.row_index}`,
      r.status,
      r.predicted_grade !== null ? r.predicted_grade : '',
      r.support_level || '',
      `"${(r.error_message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sais_batch_predictions_${mode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredRows = (result?.results || []).filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const idMatch = (r.student_id || '').toLowerCase().includes(q);
      const errorMatch = (r.error_message || '').toLowerCase().includes(q);
      const levelMatch = (r.support_level || '').toLowerCase().includes(q);
      return idMatch || errorMatch || levelMatch;
    }
    return true;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Batch Student Prediction</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process multiple student records from a CSV file with automatic schema validation and risk indexing
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-2">
          <a
            href={api.getTemplateDownloadUrl(mode)}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download size={13} />
            <span>Download {mode === 'early' ? 'Early' : 'Assisted'} Template</span>
          </a>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Upload & Options Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Upload Student Cohort File (.csv)</h3>
            <p className="text-xs text-slate-500">Supports standard comma or semicolon-delimited CSV formats</p>
          </div>

          <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => { setMode('early'); setResult(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'early' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mode 1: Early (Excl. G1/G2)
            </button>
            <button
              onClick={() => { setMode('grade_assisted'); setResult(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'grade_assisted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mode 2: Grade-Assisted (Incl. G1/G2)
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <input
            type="file"
            id="batch-csv-input"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="batch-csv-input" className="cursor-pointer space-y-2 block">
            <UploadCloud size={36} className="mx-auto text-blue-600" />
            <div className="text-sm font-semibold text-slate-800">
              {file ? file.name : 'Click to select CSV file or drag and drop'}
            </div>
            <p className="text-xs text-slate-400">
              {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Maximum file size: 5MB'}
            </p>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleProcessBatch}
            disabled={!file || loading}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Validating & Processing Records...' : 'Run Batch Predictions'}
          </button>
        </div>
      </div>

      {/* Batch Processing Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Processed Records</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{result.total_rows}</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase">Valid Inferences</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{result.valid_rows_count}</div>
            </div>
            <div className="bg-white rounded-xl border border-rose-200 bg-rose-50/40 p-4">
              <span className="text-[11px] font-semibold text-rose-700 uppercase">Invalid Rows</span>
              <div className="text-2xl font-bold text-rose-700 mt-1">{result.error_rows_count}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Cohort Mean Grade</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {result.mean_predicted_grade ? `${result.mean_predicted_grade} / 20` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Results Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search results..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="ERROR">Errors Only</option>
                </select>
              </div>

              <button
                onClick={handleExportResultsCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Download size={13} />
                <span>Export Predictions CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Row</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Predicted G3</th>
                    <th className="p-3">Support Need</th>
                    <th className="p-3">Diagnostic Notes / Validation Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {filteredRows.map((row) => (
                    <tr key={row.row_index} className="hover:bg-slate-50">
                      <td className="p-3 font-sans text-slate-400">{row.row_index}</td>
                      <td className="p-3 font-sans font-medium">{row.student_id || `Student-${row.row_index}`}</td>
                      <td className="p-3 font-sans">
                        <Badge variant={row.status === 'SUCCESS' ? 'safe' : 'critical'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">
                        {row.predicted_grade !== null && row.predicted_grade !== undefined ? (
                          <span className={row.predicted_grade >= 10 ? 'text-emerald-600' : 'text-rose-600'}>
                            {row.predicted_grade} / 20
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 font-sans">
                        {row.support_level ? (
                          <Badge variant={row.support_badge || 'neutral'}>
                            {row.support_level}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 font-sans text-slate-500 max-w-xs truncate">
                        {row.error_message ? (
                          <span className="text-rose-600 font-medium">{row.error_message}</span>
                        ) : (
                          row.influencing_factors.join('; ') || 'Standard progression'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

