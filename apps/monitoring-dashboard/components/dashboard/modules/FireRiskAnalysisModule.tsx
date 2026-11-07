import { ContributingFactor, FireRiskPrediction } from "@fire-monitoring/shared";

export function FireRiskAnalysisModule({
  riskPrediction,
}: {
  riskPrediction: Omit<FireRiskPrediction, 'id' | 'predictedAt'>;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#172033] p-5">
      <h2 className="text-sm font-bold text-slate-100">
        Weighted Heuristic Fire Susceptibility Breakdown ({riskPrediction.modelVersion})
      </h2>
      <p className="mt-1 text-xs text-amber-300">{riskPrediction.disclaimer}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        {riskPrediction.contributingFactors.map((factor: ContributingFactor) => (
          <div
            key={factor.parameter}
            className="rounded-lg border border-slate-800 bg-[#111827] p-3"
          >
            <p className="text-xs text-slate-400">
              {factor.parameter} ({Math.round(factor.weight * 100)}%)
            </p>
            <p className="mt-1 text-sm font-bold text-slate-100">{factor.value}</p>
            <p className="mt-1 text-xs text-[#38BDF8]">
              +{factor.contributionScore} pts ({factor.impactLevel})
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}