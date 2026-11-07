import { DailyFireRiskReport } from "@fire-monitoring/shared";

export function DailyReportsModule({
  reports,
  onGenerateDailyReport,
}: {
  reports: DailyFireRiskReport[];
  onGenerateDailyReport: () => void;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-100">Daily Fire Risk Reports</h2>
        <button
          type="button"
          onClick={onGenerateDailyReport}
          className="rounded-lg bg-[#38BDF8] px-3 py-1.5 text-xs font-semibold text-slate-950"
        >
          Generate Daily Report
        </button>
      </div>
      <div className="space-y-3">
        {reports.map((report: DailyFireRiskReport) => (
          <div key={report.id} className="rounded-lg border border-slate-800 bg-[#111827] p-4">
            <p className="text-xs font-bold text-slate-100">
              Environmental Susceptibility Report — {report.reportDate} (Score:{' '}
              {report.dailyRiskScore}/100 {report.riskClassification})
            </p>
            <p className="mt-1 text-xs text-slate-300">{report.riskFactorAnalysis}</p>
          </div>
        ))}
      </div>
    </section>
  );
}