'use client';
import { SystemAlert } from '@fire-monitoring/shared';
import { Flame } from 'lucide-react';
import React from 'react';
import { ModuleTab } from '../dashboard/MonitoringCenterShell';

export function Sidebar({ alerts, activeModule, setActiveModule }: { alerts: SystemAlert[]; activeModule: ModuleTab; setActiveModule: React.Dispatch<React.SetStateAction<ModuleTab>> }): React.JSX.Element {
  const MODULES: readonly ModuleTab[] = [
    'Overview',
    'Weather Monitoring',
    'Live Cameras',
    'Fire Risk Analysis',
    'Daily Reports',
    'Alerts & Notifications',
    'System Logs',
    'Settings',
  ];


  return <aside data-Component="Sidebar" className="w-64 shrink-0 border-r border-slate-800 bg-[#111827] p-4">
    <div className="mb-6 flex items-center gap-2.5 px-2">
      <Flame className="h-6 w-6 text-[#38BDF8]" />
      <div>
        <span className="text-sm font-bold tracking-wide text-slate-100">
          FOREST GUARD
        </span>
        <p className="text-[11px] text-slate-400">Monitoring & CCTV Center</p>
      </div>
    </div>

    <nav className="space-y-1">
      {MODULES.map((module: ModuleTab) => (
        <button
          key={module}
          type="button"
          onClick={() => setActiveModule(module)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${activeModule === module
            ? 'bg-[#38BDF8]/15 text-[#38BDF8]'
            : 'text-slate-300 hover:bg-slate-800/60'
            }`}
        >
          <span>{module}</span>
          {module === 'Alerts & Notifications' && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
              {alerts.filter((alert) => alert.status === 'CREATED').length}
            </span>
          )}
        </button>
      ))}
    </nav>
  </aside>;
}
