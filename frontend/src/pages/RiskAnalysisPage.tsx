import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sliders,
  Scale,
  Brain
} from 'lucide-react';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';

export const RiskAnalysisPage: React.FC = () => {
  const [highThreshold, setHighThreshold] = useState<number>(10.0);
  const [modThreshold, setModThreshold] = useState<number>(14.0);
  const [simGrade, setSimGrade] = useState<number>(9.5);

  const getTier = (grade: number) => {
    if (grade < highThreshold) {
      return {
        level: 'High Support Need (At-Risk Tier)',
        variant: 'critical' as const,
        description: `Predicted grade (${grade}/20) is below the critical threshold of ${highThreshold}. Formal academic intervention, tutoring, and attendance monitoring are advised.`,
        recommendation: 'Targeted mathematics remediation; review prerequisites; evaluate attendance constraints.'
      };
    } else if (grade < modThreshold) {
      return {
        level: 'Moderate Support Need (Reinforcement Tier)',
        variant: 'warning' as const,
        description: `Predicted grade (${grade}/20) meets minimum passing criteria (${highThreshold}) but falls below ${modThreshold}. Reinforcement recommended to build mastery.`,
        recommendation: 'Guided study sessions; peer learning circles; continuous progress quizzes.'
      };
    } else {
      return {
        level: 'Low Support Need (Stable Tier)',
        variant: 'safe' as const,
        description: `Predicted grade (${grade}/20) is at or above ${modThreshold}, indicating solid mastery of course concepts.`,
        recommendation: 'Advanced enrichment problems; autonomous project work; peer mentorship.'
      };
    }
  };

  const currentTier = getTier(simGrade);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Risk Analysis</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Transparent, rule-based academic support indicator configured on empirical grade thresholds
        </p>
      </div>

      {/* Ethical Guidance Notice */}
      <Alert type="info" title="Ethical Disclaimer & Methodological Notice">
        The Academic Risk Indicator is <strong>not</strong> an algorithmic judgment of student intellect or character. It is an advisory statistical heuristic derived from historical mathematics cohort trends. Academic institutions configure thresholds according to their curriculum requirements (e.g. 10/20 standard passing mark in the Portuguese educational system).
      </Alert>

      {/* Interactive Threshold Configuration & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Threshold Configuration Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Configurable Support Thresholds</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Critical Passing Threshold (High Risk if below)</span>
                <span className="font-mono text-rose-600 font-bold">{highThreshold} / 20</span>
              </div>
              <input
                type="range"
                min={5}
                max={15}
                step={0.5}
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Default: 10.0 (Standard European/Portuguese university passing benchmark)
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Mastery / Stable Threshold (Moderate Risk if below)</span>
                <span className="font-mono text-amber-600 font-bold">{modThreshold} / 20</span>
              </div>
              <input
                type="range"
                min={highThreshold + 0.5}
                max={18}
                step={0.5}
                value={modThreshold}
                onChange={(e) => setModThreshold(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Default: 14.0 (Identifies students passing marginally who would benefit from reinforcement)
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg text-xs space-y-2 border border-slate-100">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Active Decision Rules:</h4>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              <li>• <strong>Grade &lt; {highThreshold}:</strong> High Academic Support Required</li>
              <li>• <strong>{highThreshold} &le; Grade &lt; {modThreshold}:</strong> Moderate Support Needed</li>
              <li>• <strong>Grade &ge; {modThreshold}:</strong> Low Support Needed (Stable)</li>
            </ul>
          </div>
        </div>

        {/* Real-time Indicator Tester */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Scale size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Interactive Grade Risk Tester</h3>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Simulate Estimated Final Grade:</span>
                <span className="font-mono text-blue-600 font-bold text-sm">{simGrade} / 20</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={simGrade}
                onChange={(e) => setSimGrade(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Result Tier Box */}
            <div className="mt-6 p-4 rounded-xl border space-y-3 bg-slate-50/70 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Triggered Indicator:</span>
                <Badge variant={currentTier.variant}>{currentTier.level}</Badge>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {currentTier.description}
              </p>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                <strong>Pedagogical Recommendation:</strong> {currentTier.recommendation}
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg text-[11px] text-blue-900 border border-blue-100 flex items-start gap-2">
            <HelpCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              Thresholds adjust dynamically across the SAIS platform and apply automatically to batch CSV uploads and individual student predictions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

