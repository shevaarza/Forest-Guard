import { SystemLogEntry, UserRole } from "@fire-monitoring/shared";

export function SystemLogsModule({
  logs,
  role,
}: {
  logs: SystemLogEntry[];
  role: UserRole;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <h2 className="mb-3 text-sm font-bold text-slate-100">
        System Logs (Active RBAC Role: {role})
      </h2>
      <div className="space-y-2">
        {logs.map((log: SystemLogEntry) => (
          <div key={log.id} className="rounded-lg border border-slate-800 bg-[#111827] p-3 text-xs">
            <p className="font-semibold text-slate-200">
              [{log.level}] {log.sourceService} — {log.message}
            </p>
            {role === 'ADMIN' && log.stackTrace ? (
              <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-2 text-[11px] text-slate-400">
                {log.stackTrace}
              </pre>
            ) : (
              <p className="mt-1 text-[11px] italic text-slate-500">
                Stack trace restricted to ADMIN role.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}