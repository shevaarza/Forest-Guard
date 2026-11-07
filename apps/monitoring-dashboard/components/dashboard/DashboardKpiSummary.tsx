import { FireRiskPrediction, WeatherData } from "@fire-monitoring/shared";

export function DashboardKpiSummary({
  weather,
  riskPrediction,
  onlineCamerasCount,
  offlineCamerasCount,
}: {
  weather: WeatherData;
  riskPrediction: Omit<FireRiskPrediction, 'id' | 'predictedAt'>;
  onlineCamerasCount: number;
  offlineCamerasCount: number;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-xl border border-slate-800 bg-[#172033] p-4">
        <p className="text-xs text-slate-400">Ambient Temperature</p>
        <p className="mt-1 text-2xl font-bold text-slate-100">
          {weather.temperatureC !== null
            ? `${weather.temperatureC.toFixed(1)} °C`
            : 'Unavailable'}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Humidity:{' '}
          {weather.humidityPct !== null
            ? `${weather.humidityPct.toFixed(1)}%`
            : 'Unavailable'}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#172033] p-4">
        <p className="text-xs text-slate-400">Susceptibility Score</p>
        <p className="mt-1 text-2xl font-bold text-[#F59E0B]">
          {riskPrediction.riskScore}/100 ({riskPrediction.classification})
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Weather-Based Indicator (Not Confirmed Fire)
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#172033] p-4">
        <p className="text-xs text-slate-400">CCTV Fleet Status</p>
        <p className="mt-1 text-2xl font-bold text-[#22C55E]">
          {onlineCamerasCount} Online / {offlineCamerasCount} Offline
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Total Registered: {weather.stationId ? '3' : '0'}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#172033] p-4">
        <p className="text-xs text-slate-400">Atmospheric Pressure & UV</p>
        <p className="mt-1 text-lg font-bold text-slate-200">
          {weather.pressureHpa !== null ? `${weather.pressureHpa} hPa` : 'Unavailable'} /{' '}
          {weather.uvIndex !== null ? `UV ${weather.uvIndex}` : 'Unavailable'}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Unprovided BMKG sensors shown as Unavailable
        </p>
      </div>
    </div>
  );
}