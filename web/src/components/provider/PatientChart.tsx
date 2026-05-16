"use client";

import { useEffect, useMemo, useState } from "react";
import { copy, t } from "@/lib/copy";
import { getPatientChart } from "@/lib/patient-chart";
import { getPlan } from "@/lib/plan-store";
import { buildRecommendations } from "@/lib/recommendations";
import { detectSignals } from "@/lib/signals";
import type { Locale, PatientId, PlanItem } from "@/lib/types";
import { EvidenceSearch } from "./EvidenceSearch";
import { MovementHeatmap } from "./MovementHeatmap";
import { PainSummary } from "./PainSummary";
import { PainTimelineChart } from "./PainTimelineChart";
import { PatientBanner } from "./PatientBanner";
import { PrescribingHero } from "./PrescribingHero";
import { ProposedPlan } from "./ProposedPlan";
import { RxRecommendations } from "./RxRecommendations";
import { SignalsPanel } from "./SignalsPanel";

interface PatientChartProps {
  locale: Locale;
  patientId?: PatientId;
}

type Tab = "chart" | "summary";

const STEP_COPY: Record<
  Locale,
  {
    step1: string;
    step1Sub: string;
    step2: string;
    step2Sub: string;
    step3: string;
    step3Sub: string;
    step4: string;
    step4Sub: string;
    noHero: string;
    noHeroSub: string;
  }
> = {
  en: {
    step1: "01 · The decision",
    step1Sub: "What the evidence and the chart say to do next.",
    step2: "02 · The pain journey behind it",
    step2Sub: "Trend, scheduled doses, and missed doses for the last week.",
    step3: "03 · Other considerations",
    step3Sub: "Adjuncts, tapers, and non-pharmacologic moves to weigh.",
    step4: "04 · Ask another question · commit to a plan",
    step4Sub: "Run an evidence query with the chart attached, then save the plan.",
    noHero: "No recommendation right now",
    noHeroSub:
      "Current chart signals don't warrant a Rx change today. Review the pain journey below or ask an evidence question.",
  },
  es: {
    step1: "01 · La decisión",
    step1Sub: "Lo que la evidencia y el expediente sugieren hacer.",
    step2: "02 · El trayecto del dolor detrás",
    step2Sub: "Tendencia, dosis programadas y omitidas de la última semana.",
    step3: "03 · Otras consideraciones",
    step3Sub: "Adyuvantes, descensos y opciones no farmacológicas.",
    step4: "04 · Preguntar y comprometer un plan",
    step4Sub: "Consulte evidencia con el expediente y guarde el plan.",
    noHero: "Sin recomendación ahora",
    noHeroSub:
      "Las señales actuales no requieren cambio de Rx hoy. Revise el trayecto del dolor o haga una consulta.",
  },
};

export function PatientChart({
  locale,
  patientId = "emily",
}: PatientChartProps) {
  const [tab, setTab] = useState<Tab>("chart");

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

  const steps = STEP_COPY[locale];
  const [topRec, ...secondaryRecs] = recommendations;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Compact identity strip */}
      <PatientBanner meta={chart.meta} locale={locale} />

      {/* Section nav */}
      <nav
        className="flex items-center gap-1 border-b border-sp-line"
        aria-label="Chart sections"
      >
        <TabButton
          active={tab === "chart"}
          onClick={() => setTab("chart")}
          label={t(copy.provider.tabChart, locale)}
        />
        <TabButton
          active={tab === "summary"}
          onClick={() => setTab("summary")}
          label={t(copy.provider.tabSummary, locale)}
        />
      </nav>

      {tab === "chart" && (
        <div className="space-y-8 pb-12">
          {/* STEP 01 — THE HERO */}
          <Section eyebrow={steps.step1} sub={steps.step1Sub}>
            {topRec ? (
              <PrescribingHero
                recommendation={topRec}
                chart={chart}
                signals={signals}
                locale={locale}
                patientId={patientId}
                planItems={planItems}
                onPlanChange={setPlanItems}
              />
            ) : (
              <div className="rounded-xl border border-sp-line bg-white p-6">
                <p className="text-[15px] font-semibold text-sp-ink m-0">
                  {steps.noHero}
                </p>
                <p className="text-[13px] text-sp-muted m-0 mt-1">
                  {steps.noHeroSub}
                </p>
              </div>
            )}
          </Section>

          {/* STEP 02 — THE PAIN JOURNEY */}
          <Section eyebrow={steps.step2} sub={steps.step2Sub}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 items-start">
              <PainTimelineChart
                chart={chart}
                signals={signals}
                locale={locale}
              />
              <SignalsPanel signals={signals} locale={locale} />
            </div>
            <div className="mt-4">
              <MovementHeatmap chart={chart} locale={locale} />
            </div>
          </Section>

          {/* STEP 03 — OTHER RECS */}
          {secondaryRecs.length > 0 && (
            <Section eyebrow={steps.step3} sub={steps.step3Sub}>
              <RxRecommendations
                recommendations={secondaryRecs}
                signals={signals}
                chart={chart}
                locale={locale}
                patientId={patientId}
                planItems={planItems}
                onPlanChange={setPlanItems}
              />
            </Section>
          )}

          {/* STEP 04 — EVIDENCE SEARCH + PLAN */}
          <Section eyebrow={steps.step4} sub={steps.step4Sub}>
            <div className="space-y-4">
              <EvidenceSearch
                chart={chart}
                signals={signals}
                locale={locale}
              />
              <ProposedPlan
                items={planItems}
                patientId={patientId}
                locale={locale}
                onChange={setPlanItems}
              />
            </div>
          </Section>
        </div>
      )}

      {tab === "summary" && (
        <PainSummary patientId={patientId} locale={locale} />
      )}
    </div>
  );
}

function Section({
  eyebrow,
  sub,
  children,
}: {
  eyebrow: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3">
        <p className="text-[10.5px] uppercase tracking-[0.14em] text-sp-teal-800 font-semibold m-0">
          {eyebrow}
        </p>
        <p className="text-[12.5px] text-sp-muted m-0 mt-0.5">{sub}</p>
      </header>
      {children}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2.5 text-[13.5px] font-medium transition ${
        active ? "text-sp-teal-800" : "text-sp-muted hover:text-sp-text"
      }`}
    >
      {label}
      {active && (
        <span
          className="absolute left-2 right-2 -bottom-px h-[2px] bg-sp-teal-600"
          aria-hidden
        />
      )}
    </button>
  );
}
