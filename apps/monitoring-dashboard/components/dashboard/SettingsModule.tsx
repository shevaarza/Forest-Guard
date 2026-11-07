export function SettingsModule(): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <h2 className="text-sm font-bold text-slate-100">
        Alert Thresholds & Monitoring Preferences
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Server secrets (SUPABASE_SERVICE_ROLE_KEY, CAMERA_API_SECRET) are isolated on the
        server and never exposed to the client.
      </p>
    </section>
  );
}