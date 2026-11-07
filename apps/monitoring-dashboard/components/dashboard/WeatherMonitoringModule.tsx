import { WeatherData } from "@fire-monitoring/shared";

export function WeatherMonitoringModule({
  weather,
  onTriggerExtremeDrySpell,
}: {
  weather: WeatherData;
  onTriggerExtremeDrySpell: () => void;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100">
            BMKG Weather Telemetry ({weather.locationName})
          </h2>
          <p className="text-xs text-slate-400">Source Badge: {weather.dataSource}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTriggerExtremeDrySpell}
            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30"
          >
            Simulate Extreme Dry Spell
          </button>
        </div>
      </div>
    </section>
  );
}