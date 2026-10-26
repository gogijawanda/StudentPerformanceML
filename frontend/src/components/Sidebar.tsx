import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Database,
  FlaskConical,
  GraduationCap,
  ShieldAlert,
  ToggleLeft,
  Users,
  FileSpreadsheet,
  BrainCircuit,
  FileText,
  School
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems = [
    { id: 'quick_predict', label: 'Quick Predictor (Any Student)', icon: Sparkles, section: 'Simple Predictor', highlight: true },
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, section: 'Dashboard' },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database, section: 'Dashboard' },
    { id: 'predict', label: 'Advanced 0–20 Predictor', icon: GraduationCap, section: 'Machine Learning Models' },
    { id: 'risk', label: 'Academic Risk Analysis', icon: ShieldAlert, section: 'Machine Learning Models' },
    { id: 'classification', label: 'Pass / Fail Pipeline', icon: ToggleLeft, section: 'Machine Learning Models' },
    { id: 'models', label: 'ML Model Laboratory', icon: FlaskConical, section: 'Advanced Analytics' },
    { id: 'segmentation', label: 'Student Segmentation', icon: Users, section: 'Advanced Analytics' },
    { id: 'batch', label: 'Batch CSV Upload', icon: FileSpreadsheet, section: 'Advanced Analytics' },
    { id: 'explainability', label: 'Model Explainability', icon: BrainCircuit, section: 'Advanced Analytics' },
    { id: 'reports', label: 'Reports & Viva Voce', icon: FileText, section: 'Academic Defense' }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <School size={22} />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight">SAIS</h1>
          <p className="text-[11px] text-slate-400 font-medium">Academic Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const showSection = idx === 0 || item.section !== menuItems[idx - 1].section;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : item.highlight
                    ? 'text-blue-300 bg-blue-950/40 border border-blue-800/60 hover:bg-blue-900/40 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'} />
                <span className="truncate">{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400">Target Range</span>
          <span className="text-blue-400 font-mono font-medium">Any Student (Age 10-60)</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Project Type</span>
          <span className="text-emerald-400 font-medium">MCA Capstone</span>
        </div>
      </div>
    </aside>
  );
};
