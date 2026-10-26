import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Info,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { StudentInput, PredictionResult } from '../types';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';

const DEFAULT_STUDENT: StudentInput = {
  school: 'GP',
  sex: 'F',
  age: 16,
  address: 'U',
  famsize: 'GT3',
  Pstatus: 'T',
  Medu: 3,
  Fedu: 3,
  Mjob: 'other',
  Fjob: 'other',
  reason: 'course',
  guardian: 'mother',
  traveltime: 1,
  studytime: 2,
  failures: 0,
  schoolsup: 'no',
  famsup: 'yes',
  paid: 'no',
  activities: 'yes',
  nursery: 'yes',
  higher: 'yes',
  internet: 'yes',
  romantic: 'no',
  famrel: 4,
  freetime: 3,
  goout: 3,
  Dalc: 1,
  Walc: 1,
  health: 4,
  absences: 2,
  G1: 12,
  G2: 12
};

export const GradePredictionPage: React.FC = () => {
  const [mode, setMode] = useState<'early' | 'grade_assisted'>('early');
  const [formData, setFormData] = useState<StudentInput>(DEFAULT_STUDENT);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof StudentInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictGrade({
        student: formData,
        mode: mode,
        high_risk_threshold: 10.0,
        moderate_risk_threshold: 14.0
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_STUDENT);
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Grade Prediction</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Predict final mathematics score (0–20 scale) and derive personalized academic indicators
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('early'); setResult(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'early'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode 1: Early Prediction (Excl. G1/G2)
          </button>
          <button
            type="button"
            onClick={() => { setMode('grade_assisted'); setResult(null); }}
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

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interim Grades (Only in Grade-Assisted Mode) */}
            {mode === 'grade_assisted' && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={15} />
                  <span>Prior Term Examination Benchmarks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Period 1 Grade (G1: 0–20)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      value={formData.G1 ?? 12}
                      onChange={(e) => handleChange('G1', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Period 2 Grade (G2: 0–20)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      value={formData.G2 ?? 12}
                      onChange={(e) => handleChange('G2', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Behavior & Attendance */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Academic Engagement & Attendance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Weekly Study Time</label>
                  <select
                    value={formData.studytime}
                    onChange={(e) => handleChange('studytime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={1}>&lt; 2 hours/week</option>
                    <option value={2}>2 to 5 hours/week</option>
                    <option value={3}>5 to 10 hours/week</option>
                    <option value={4}>&gt; 10 hours/week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Past Course Failures</label>
                  <select
                    value={formData.failures}
                    onChange={(e) => handleChange('failures', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={0}>0 failures (Clean track)</option>
                    <option value={1}>1 failure</option>
                    <option value={2}>2 failures</option>
                    <option value={3}>3 failures</option>
                    <option value={4}>4+ failures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Absences (0–93)</label>
                  <input
                    type="number"
                    min={0}
                    max={93}
                    value={formData.absences}
                    onChange={(e) => handleChange('absences', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Demographics & School Environment */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Student Demographics & Aspirations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">School</label>
                  <select
                    value={formData.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="GP">Gabriel Pereira</option>
                    <option value="MS">Mousinho da Silveira</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sex</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Age (15–22)</label>
                  <input
                    type="number"
                    min={15}
                    max={22}
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 16)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Higher Education</label>
                  <select
                    value={formData.higher}
                    onChange={(e) => handleChange('higher', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="yes">Yes (Aspirant)</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Family Background */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Family & Home Environment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mother Education (Medu)</label>
                  <select
                    value={formData.Medu}
                    onChange={(e) => handleChange('Medu', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value={0}>0: None</option>
                    <option value={1}>1: Primary (4th grade)</option>
                    <option value={2}>2: 5th to 9th grade</option>
                    <option value={3}>3: Secondary education</option>
                    <option value={4}>4: Higher education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Father Education (Fedu)</label>
                  <select
                    value={formData.Fedu}
                    onChange={(e) => handleChange('Fedu', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value={0}>0: None</option>
                    <option value={1}>1: Primary (4th grade)</option>
                    <option value={2}>2: 5th to 9th grade</option>
                    <option value={3}>3: Secondary education</option>
                    <option value={4}>4: Higher education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Internet at Home</label>
                  <select
                    value={formData.internet}
                    onChange={(e) => handleChange('internet', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset Fields</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Evaluating Model...' : 'Calculate Predicted Grade'}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Output Column */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Model Estimation
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {result.predicted_grade}{' '}
                    <span className="text-base font-normal text-slate-400">/ 20</span>
                  </div>
                  <Badge variant={result.support_indicator.badge}>
                    {result.support_indicator.level}
                  </Badge>
                </div>
              </div>

              {/* Indicator explanation */}
              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                result.support_indicator.badge === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : result.support_indicator.badge === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                {result.support_indicator.rule_explanation}
              </div>

              {/* Influencing factors */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Key Identified Contributing Factors
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.influencing_factors.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evaluation Metrics of the Active Model */}
              <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Model</span>
                  <strong className="text-slate-800">{result.model_used}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Model Test MAE</span>
                  <span className="font-mono">{result.model_test_metrics.mae}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Model Test R²</span>
                  <span className="font-mono text-blue-600 font-semibold">{result.model_test_metrics.r2}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 leading-normal border border-slate-100">
                {result.disclaimer}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 space-y-3">
              <GraduationCap size={36} className="mx-auto text-slate-300" />
              <h4 className="font-semibold text-slate-700 text-sm">Ready to Predict</h4>
              <p className="text-xs max-w-xs mx-auto">
                Select your parameters and click <strong>Calculate Predicted Grade</strong> to view the real scikit-learn model forecast and risk indicator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

