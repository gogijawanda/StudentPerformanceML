import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading empirical data...', size = 32 }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Loader2 size={size} className="animate-spin text-blue-600 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

