"use client";

import { useEffect, useMemo, useState } from "react";
import { getPatientChart } from "@/lib/patient-chart";
import { getPlan } from "@/lib/plan-store";
import { buildRecommendations } from "@/lib/recommendations";
import { detectSignals } from "@/lib/signals";
import type { Locale, PatientId, PlanItem } from "@/lib/types";
import { EvidenceSearch } from "./EvidenceSearch";
import { MovementHeatmap } from "./MovementHeatmap";
import { PainTimelineChart } from "./PainTimelineChart";
import { PatientBanner } from "./PatientBanner";
import { ProposedPlan } from "./ProposedPlan";
import { RxRecommendations } from "./RxRecommendations";
import { SignalsPanel } from "./SignalsPanel";

interface PatientChartProps {
  locale: Locale;
  patientId?: PatientId;
}

export function PatientChart({ locale, patientId = "emily" }: PatientChartProps) {
  const chart = useMemo(() => getPatientChart(patientId), [patientId]);
  const signals = useMemo(() => detectSignals(chart), [chart]);
  const recommendations = useMemo(
    () => buildRecommendations(chart, signals),
    [chart, signals],
  );

  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  useEffect(() => {
    setPlanItems(getPlan(patientId));
  }, [patientId]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <PatientBanner meta={chart.meta} locale={locale} />
        </div>
        <div className="lg:col-span-2">
          <SignalsPanel signals={signals} locale={locale} />
        </div>
      </div>

      <PainTimelineChart chart={chart} signals={signals} locale={locale} />
      <MovementHeatmap chart={chart} locale={locale} />

      <RxRecommendations
        recommendations={recommendations}
        signals={signals}
        chart={chart}
        locale={locale}
        patientId={patientId}
        planItems={planItems}
        onPlanChange={setPlanItems}
      />

      <EvidenceSearch chart={chart} signals={signals} locale={locale} />

      <ProposedPlan
        items={planItems}
        patientId={patientId}
        locale={locale}
        onChange={setPlanItems}
      />
    </div>
  );
}
