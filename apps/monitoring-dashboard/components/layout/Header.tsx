'use client';
import { UserRole, WeatherData } from '@fire-monitoring/shared';
import React, { useState } from 'react';

export function Header({ weather, roles }: { weather: WeatherData, roles: UserRole }): React.JSX.Element {
  const [role, setRole] = useState<UserRole>(roles);

  return <header data-component="Header" className="flex items-center justify-between border-b border-slate-800 bg-[#111827] px-6 py-3.5">
    <div>
      <h1 className="text-lg font-bold text-slate-100">
        Fire Risk Monitoring & Live CCTV Dashboard
      </h1>
      <p className="text-xs text-slate-400">
        Data Source:{' '}
        <span className="font-semibold text-[#38BDF8]">{weather.dataSource}</span> | Last
        Sync: {new Date(weather.syncedAt).toLocaleTimeString()}
      </p>
    </div>

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setRole((currentRole) => (currentRole === 'OPERATOR' ? 'ADMIN' : 'OPERATOR'))}
        className="rounded border border-slate-700 bg-[#172033] px-3 py-1.5 text-xs font-semibold text-slate-200"
      >
        Role: {role}
      </button>
    </div>
  </header>;
}
