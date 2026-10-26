import React, { useState, useEffect } from 'react';
import {
  ToggleLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { ClassificationMetricsResponse, ClassificationModelItem, StudentInput } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';

export const ClassificationPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ClassificationMetricsResponse | null>(null);
  const [mode, setMode] = useState<'early' | 'grade_assisted'>('early');
  const [selectedModel, setSelectedModel] = useState<ClassificationModelItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live test student state
  const [testStudy, setTestStudy] = useState(2);
  const [testFailures, setTestFailures] = useState(0);
  const [testAbsences, setTestAbsences] = useState(2);
  const [testG1, setTestG1] = useState(11);
  const [testG2, setTestG2] = useState(11);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getClassificationMetrics();
      setMetrics(res);
      if (res[mode]) {
        const best = res[mode].models.find((m) => m.is_best) || res[mode].models[0];
        setSelectedModel(best);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load classification metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (metrics && metrics[mode]) {
      const best = metrics[mode].models.find((m) => m.is_best) || metrics[mode].models[0];
      setSelectedModel(best);
    }
  }, [mode, metrics]);

  const handleSimulate = async () => {
    try {
      setSimLoading(true);
      const student: any = {
        school: 'GP', sex: 'F', age: 16, address: 'U', famsize: 'GT3',
        Pstatus: 'T', Medu: 3, Fedu: 3, Mjob: 'other', Fjob: 'other',
        reason: 'course', guardian: 'mother', traveltime: 1, studytime: testStudy,
        failures: testFailures, schoolsup: 'no', famsup: 'yes', paid: 'no',
        activities: 'yes', nursery: 'yes', higher: 'yes', internet: 'yes',
        romantic: 'no', famrel: 4, freetime: 3, goout: 3, Dalc: 1,
        Walc: 1, health: 4, absences: testAbsences
      };
      if (mode === 'grade_assisted') {
        student.G1 = testG1;
        student.G2 = testG2;
      }
      const res = await api.predictClassification({
        student,
        mode,
        model_name: selectedModel?.name,
        pass_threshold: 10
      });
      setSimResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Evaluating classification algorithms..." />;
  if (error || !metrics) return <div className="p-8"><Alert type="error">{error || 'Data unavailable'}</Alert></div>;

  const currentMode = metrics[mode];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pass / Fail Classification Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Binary outcome classification at threshold G3 &ge; 10 (Pass rate: {currentMode.class_distribution.pass_rate_pct}%)
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setMode('early')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'early' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 1: Early Classification
          </button>
          <button
            onClick={() => setMode('grade_assisted')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'grade_assisted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 2: Grade-Assisted
          </button>
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Classifier Performance Comparison (Held-out Test Cohort, N=79)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Top Classifier: <strong>{currentMode.best_model_name}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Classifier</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Precision</th>
                <th className="p-3.5">Recall</th>
                <th className="p-3.5">F1-Score</th>
                <th className="p-3.5">ROC-AUC</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {currentMode.models.map((model) => {
                const isSelected = selectedModel?.name === model.name;
                return (
                  <tr
                    key={model.name}
                    onClick={() => setSelectedModel(model)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-3.5 font-sans font-medium text-slate-900 flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.is_best && <Badge variant="safe" className="font-sans text-[10px]">Best</Badge>}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{(model.metrics.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-3.5">{model.metrics.precision.toFixed(3)}</td>
                    <td className="p-3.5">{model.metrics.recall.toFixed(3)}</td>
                    <td className="p-3.5 font-bold text-blue-600">{model.metrics.f1_score.toFixed(3)}</td>
                    <td className="p-3.5 text-slate-500">{model.metrics.roc_auc ? model.metrics.roc_auc.toFixed(3) : 'N/A'}</td>
                    <td className="p-3.5 font-sans">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${isSelected ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                        {isSelected ? 'Active' : 'Select'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model: Confusion Matrix & Interactive Classifier */}
      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Confusion Matrix Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Confusion Matrix: {selectedModel.name}
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation on 79 unseen test samples (stratified split)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">True Negative (TN)</span>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {selectedModel.metrics.confusion_matrix.tn}
                </div>
                <span className="text-[10px] text-slate-400">Correctly predicted Fail</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-700 uppercase font-semibold">False Positive (FP)</span>
                <div className="text-2xl font-bold text-rose-700 mt-1">
                  {selectedModel.metrics.confusion_matrix.fp}
                </div>
                <span className="text-[10px] text-rose-500">Type I error (False Pass)</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase font-semibold">False Negative (FN)</span>
                <div className="text-2xl font-bold text-amber-700 mt-1">
                  {selectedModel.metrics.confusion_matrix.fn}
                </div>
                <span className="text-[10px] text-amber-500">Type II error (Missed Pass)</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold">True Positive (TP)</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  {selectedModel.metrics.confusion_matrix.tp}
                </div>
                <span className="text-[10px] text-emerald-500">Correctly predicted Pass</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              <strong>Evaluation Summary:</strong> Accuracy: {(selectedModel.metrics.accuracy * 100).toFixed(1)}% | F1-Score: {selectedModel.metrics.f1_score.toFixed(3)}
            </div>
          </div>

          {/* Interactive Classifier Simulator */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Pass / Fail Outcome Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Test model probability estimation with sample inputs
              </p>
            </div>

            <div className="space-y-3">
              {mode === 'grade_assisted' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Period 1 Grade (G1)</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={testG1}
                      onChange={(e) => setTestG1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Period 2 Grade (G2)</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={testG2}
                      onChange={(e) => setTestG2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Study Time</label>
                  <select
                    value={testStudy}
                    onChange={(e) => setTestStudy(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value={1}>&lt; 2h</option>
                    <option value={2}>2–5h</option>
                    <option value={3}>5–10h</option>
                    <option value={4}>&gt; 10h</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Past Failures</label>
                  <select
                    value={testFailures}
                    onChange={(e) => setTestFailures(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Absences</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={testAbsences}
                    onChange={(e) => setTestAbsences(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulate}
                disabled={simLoading}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {simLoading ? 'Simulating...' : 'Simulate Classification'}
              </button>

              {simResult && (
                <div className={`p-4 rounded-xl border mt-3 flex items-center justify-between ${
                  simResult.outcome === 'Pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {simResult.outcome === 'Pass' ? (
                      <CheckCircle2 size={24} className="text-emerald-600" />
                    ) : (
                      <XCircle size={24} className="text-rose-600" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Predicted Outcome: {simResult.outcome}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Pass Probability:{' '}
                        <strong>{simResult.probability_pass ? `${(simResult.probability_pass * 100).toFixed(1)}%` : 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                  <Badge variant={simResult.outcome === 'Pass' ? 'safe' : 'critical'}>
                    {simResult.outcome}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

