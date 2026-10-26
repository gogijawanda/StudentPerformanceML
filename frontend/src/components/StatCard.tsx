import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant: 'safe' | 'warning' | 'critical' | 'info' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, badge }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium border ${
              badge.variant === 'safe'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : badge.variant === 'critical'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : badge.variant === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

