import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Printer,
  RotateCcw,
  BookOpen,
  School,
  TrendingUp,
  Percent,
  Clock,
  CalendarCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { UniversalStudentRequest, UniversalPredictionResponse } from '../types';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';

const PRESETS: { [key: string]: UniversalStudentRequest } = {
  college_regular: {
    student_name: 'Aarav Sharma',
    institution_name: 'National College of Engineering',
    education_level: 'College / Undergraduate (B.Tech, BCA, B.Sc, B.Com)',
    age: 20,
    gender: 'Male',
    weekly_study_hours: 8.0,
    attendance_percentage: 86.0,
    previous_score_percent: 74.0,
    past_backlogs: 0,
    has_internet: true,
    extra_coaching: false,
    aims_higher_studies: true,
    health_condition: 'Good',
    social_freetime: 'Moderate'
  },
  high_school: {
    student_name: 'Ananya Verma',
    institution_name: 'St. Mary Senior High School',
    education_level: 'Senior Secondary (11th-12th)',
    age: 17,
    gender: 'Female',
    weekly_study_hours: 10.0,
    attendance_percentage: 92.0,
    previous_score_percent: 82.0,
    past_backlogs: 0,
    has_internet: true,
    extra_coaching: true,
    aims_higher_studies: true,
    health_condition: 'Excellent',
    social_freetime: 'Moderate'
  },
  at_risk: {
    student_name: 'Karan Patel',
    institution_name: 'City Polytechnic College',
    education_level: 'College / Undergraduate (B.Tech, BCA, B.Sc, B.Com)',
    age: 21,
    gender: 'Male',
    weekly_study_hours: 2.0,
    attendance_percentage: 62.0,
    previous_score_percent: 44.0,
    past_backlogs: 2,
    has_internet: true,
    extra_coaching: false,
    aims_higher_studies: false,
    health_condition: 'Average',
    social_freetime: 'High'
  },
  top_performer: {
    student_name: 'Pooja Iyer',
    institution_name: 'Apex Institute of Technology',
    education_level: 'Postgraduate (MCA, MBA, M.Tech)',
    age: 23,
    gender: 'Female',
    weekly_study_hours: 14.0,
    attendance_percentage: 96.0,
    previous_score_percent: 91.0,
    past_backlogs: 0,
    has_internet: true,
    extra_coaching: false,
    aims_higher_studies: true,
    health_condition: 'Excellent',
    social_freetime: 'Low'
  }
};

export const QuickPredictorPage: React.FC = () => {
  const [formData, setFormData] = useState<UniversalStudentRequest>(PRESETS.college_regular);
  const [result, setResult] = useState<UniversalPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (key: string) => {
    setFormData(PRESETS[key]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictUniversal(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Friendly Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-2">
            <Sparkles size={13} />
            <span>Universal Student Predictor — Simple & Easy</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Predict Any Student's Performance in Seconds
          </h2>
          <p className="text-blue-100 text-xs mt-1 max-w-2xl leading-relaxed">
            Designed for <strong>any school, college, or university student of any age group</strong>. Enter simple details like attendance %, study hours, and past marks to get an instant academic forecast, CGPA estimate, and practical improvement tips.
          </p>
        </div>

        {/* Quick Demo Autofill Chips */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
            1-Click Quick Demo Profiles:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('college_regular')}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 font-medium transition-all"
            >
              🎓 College Student
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high_school')}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 font-medium transition-all"
            >
              🏫 School Student
            </button>
            <button
              type="button"
              onClick={() => applyPreset('at_risk')}
              className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/40 hover:bg-rose-500 text-white font-medium transition-all"
            >
              ⚠️ At-Risk Student
            </button>
            <button
              type="button"
              onClick={() => applyPreset('top_performer')}
              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/40 hover:bg-emerald-500 text-white font-medium transition-all"
            >
              ⭐ Top Ranker
            </button>
          </div>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Student Information */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                <School size={16} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  1. Student & Institution Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    School / College / University Name
                  </label>
                  <input
                    type="text"
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    placeholder="e.g. Delhi University / City High School"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={formData.education_level}
                    onChange={(e: any) => setFormData({ ...formData, education_level: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Middle / High School">Middle / High School (Class 6–10)</option>
                    <option value="Senior Secondary (11th-12th)">Senior Secondary (11th–12th)</option>
                    <option value="College / Undergraduate (B.Tech, BCA, B.Sc, B.Com)">College / Undergraduate (B.Tech, BCA, B.Sc, B.Com, BA)</option>
                    <option value="Postgraduate (MCA, MBA, M.Tech)">Postgraduate (MCA, MBA, M.Tech, M.Sc)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={70}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Key Academic Drivers */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                <TrendingUp size={16} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. Core Academic Factors (Main Prediction Drivers)
                </h3>
              </div>

              <div className="space-y-4">
                {/* Attendance Slider */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck size={14} className="text-blue-600" />
                      <span>Class Attendance Percentage</span>
                    </span>
                    <span className={`font-mono text-sm font-bold ${formData.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formData.attendance_percentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    step={1}
                    value={formData.attendance_percentage}
                    onChange={(e) => setFormData({ ...formData, attendance_percentage: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>30% (Critical)</span>
                    <span className="text-amber-600 font-semibold">75% Standard College Cutoff</span>
                    <span>100% (Perfect)</span>
                  </div>
                </div>

                {/* Study Time Slider */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-600" />
                      <span>Weekly Self-Study Time</span>
                    </span>
                    <span className="font-mono text-sm font-bold text-indigo-600">
                      {formData.weekly_study_hours} Hours / Week
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={0.5}
                    value={formData.weekly_study_hours}
                    onChange={(e) => setFormData({ ...formData, weekly_study_hours: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>&lt; 2 hrs/wk (Low)</span>
                    <span>~1 to 2 hrs daily (Recommended)</span>
                    <span>&gt; 20 hrs/wk (Intensive)</span>
                  </div>
                </div>

                {/* Previous Score & Backlogs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous Exam Score or Mid-term (% Marks)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.previous_score_percent ?? 75}
                        onChange={(e) => setFormData({ ...formData, previous_score_percent: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g. 75"
                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <Percent size={14} className="absolute right-3 top-2.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Prior test, 10th/12th mark, or previous semester %
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Past Backlogs / Failed Subjects
                    </label>
                    <select
                      value={formData.past_backlogs}
                      onChange={(e) => setFormData({ ...formData, past_backlogs: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>0 Backlogs (Clean record)</option>
                      <option value={1}>1 Failed Subject / Backlog</option>
                      <option value={2}>2 Backlogs</option>
                      <option value={3}>3 Backlogs</option>
                      <option value={4}>4+ Backlogs</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Unresolved backlogs impact final confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Supportive Environment */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                <BookOpen size={16} className="text-amber-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  3. Learning Environment & Well-being
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.has_internet}
                    onChange={(e) => setFormData({ ...formData, has_internet: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Internet Access</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.extra_coaching}
                    onChange={(e) => setFormData({ ...formData, extra_coaching: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Extra Coaching</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.aims_higher_studies}
                    onChange={(e) => setFormData({ ...formData, aims_higher_studies: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Higher Degree Goal</span>
                </label>

                <div>
                  <select
                    value={formData.health_condition}
                    onChange={(e: any) => setFormData({ ...formData, health_condition: e.target.value })}
                    className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Excellent">Health: Excellent</option>
                    <option value="Good">Health: Good</option>
                    <option value="Average">Health: Average</option>
                    <option value="Poor">Health: Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => applyPreset('college_regular')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                <RotateCcw size={13} />
                <span>Reset to Defaults</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={16} />
                <span>{loading ? 'Analyzing with ML Models...' : 'Predict Performance Now'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Output: 5 Columns (Report Card) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-6 shadow-lg space-y-6 relative overflow-hidden">
              {/* Header Ribbon */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{result.student_name}</h3>
                  <p className="text-[11px] text-slate-500">
                    {result.institution_name} • Age {result.age}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Print Report Card"
                >
                  <Printer size={16} />
                </button>
              </div>

              {/* Major Score Display Cards */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                    Predicted Percentage
                  </span>
                  <div className="text-3xl font-extrabold text-blue-900 mt-1">
                    {result.predicted_percentage}%
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600">
                    Grade: {result.letter_grade}
                  </span>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                    Estimated CGPA
                  </span>
                  <div className="text-3xl font-extrabold text-indigo-900 mt-1">
                    {result.predicted_cgpa} <span className="text-sm font-normal text-indigo-500">/ 10</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-mono">
                    ({result.predicted_grade_20} / 20 Scale)
                  </span>
                </div>
              </div>

              {/* Status & Pass Probability */}
              <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2.5">
                  {result.risk_badge === 'safe' ? (
                    <ShieldCheck size={20} className="text-emerald-600" />
                  ) : (
                    <ShieldAlert size={20} className={result.risk_badge === 'critical' ? 'text-rose-600' : 'text-amber-600'} />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {result.academic_risk}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pass Probability: <strong>{(result.pass_probability * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>
                <Badge variant={result.risk_badge}>{result.risk_badge.toUpperCase()}</Badge>
              </div>

              {/* Performance Summary */}
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                {result.performance_summary}
              </p>

              {/* Strengths & Improvement Areas */}
              <div className="space-y-3">
                {result.strengths.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>Key Student Strengths</span>
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.areas_for_improvement.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-amber-600" />
                      <span>Areas for Focus & Improvement</span>
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {result.areas_for_improvement.map((a, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actionable Advice */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-blue-600" />
                  <span>Personalized Improvement Action Plan</span>
                </h4>
                <ul className="text-[11px] text-blue-950 space-y-1 leading-relaxed">
                  {result.personalized_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={11} className="text-blue-600 mt-1 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                Computed via {result.model_used} • Statistical advisory estimate
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
              <GraduationCap size={44} className="mx-auto text-blue-500/60" />
              <h4 className="font-bold text-slate-800 text-base">Your Report Card Will Appear Here</h4>
              <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-500">
                Fill in the details or pick one of the <strong>1-Click Quick Demo Profiles</strong> at the top, then click <strong>"Predict Performance Now"</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

