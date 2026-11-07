import { SystemAlert } from "@fire-monitoring/shared";

export function AlertsNotificationsModule({
  alerts,
  onAcknowledgeAlert,
}: {
  alerts: SystemAlert[];
  onAcknowledgeAlert: (id: string) => void;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <h2 className="mb-3 text-sm font-bold text-slate-100">
        Real-Time Alerts (Lifecycle: CREATED → ACKNOWLEDGED → RESOLVED)
      </h2>
      <div className="space-y-2.5">
        {alerts.map((alert: SystemAlert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#111827] p-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                  {alert.severity}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                  {alert.status}
                </span>
                <p className="text-xs font-bold text-slate-100">{alert.title}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">{alert.description}</p>
            </div>
            {alert.status === 'CREATED' && (
              <button
                type="button"
                onClick={() => onAcknowledgeAlert(alert.id)}
                className="rounded bg-[#38BDF8]/20 px-3 py-1 text-xs font-semibold text-[#38BDF8]"
              >
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}