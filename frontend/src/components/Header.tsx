import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  title: string;
  subtitle: string;
  onModelRetrained?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onModelRetrained }) => {
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);

  const handleRetrain = async () => {
    try {
      setTraining(true);
      setTrainStatus('Retraining pipelines...');
      const res = await api.trainModels(10);
      setTrainStatus('Pipelines successfully updated!');
      if (onModelRetrained) onModelRetrained();
      setTimeout(() => setTrainStatus(null), 4000);
    } catch (err: any) {
      setTrainStatus(`Training error: ${err.message}`);
      setTimeout(() => setTrainStatus(null), 5000);
    } finally {
      setTraining(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {trainStatus && (
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            {trainStatus}
          </span>
        )}

        <button
          onClick={handleRetrain}
          disabled={training}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-all shadow-sm"
          title="Run model training and re-evaluate on identical test splits"
        >
          <RefreshCw size={14} className={training ? 'animate-spin' : ''} />
          <span>{training ? 'Training...' : 'Retrain Models'}</span>
        </button>

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <span>API Docs</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </header>
  );
};

