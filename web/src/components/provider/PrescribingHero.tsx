"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ENDPOINTS,
  parseContractEvent,
  type ContractCitation,
} from "@/lib/ai-contract";
import { copy, t } from "@/lib/copy";
import { addPlanItem } from "@/lib/plan-store";
import { CitedMarkdown } from "./CitedMarkdown";
import { SourceList } from "./SourceList";
import type {
  Locale,
  PatientChart,
  PatientId,
  PlanItem,
  RxRecommendation,
  Signal,
} from "@/lib/types";

interface PrescribingHeroProps {
  recommendation: RxRecommendation;
  chart: PatientChart;
  signals: Signal[];
  locale: Locale;
  patientId: PatientId;
  planItems: PlanItem[];
  onPlanChange: (items: PlanItem[]) => void;
}

interface EvidenceState {
  loading: boolean;
  searching: string;
  text: string;
  citations: ContractCitation[];
  error: string | null;
}

const EMPTY: EvidenceState = {
  loading: false,
  searching: "",
  text: "",
  citations: [],
  error: null,
};

const HERO_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    sub: string;
    whyNow: string;
    snapshot: string;
    pod: string;
    avgPain: string;
    onOpioid: string;
    adherence: string;
    last: string;
    nextDose: string;
    of: string;
    evidence: string;
    evidenceLive: string;
    addToPlan: string;
    added: string;
    refresh: string;
    sources: string;
    streaming: string;
    waiting: string;
    error: string;
    sparkLabel: string;
  }
> = {
  en: {
    eyebrow: "Today's prescribing decision",
    title: "Recommended next step",
    sub: "From this patient's pain journey, chart context, and live OpenEvidence search.",
    whyNow: "Why now",
    snapshot: "Snapshot",
    pod: "Post-op day",
    avgPain: "7-day avg pain",
    onOpioid: "On opioid",
    adherence: "Adherence",
    last: "Last log",
    nextDose: "Next dose",
    of: "of",
    evidence: "Evidence",
    evidenceLive: "Live from OpenEvidence",
    addToPlan: "Add to plan",
    added: "Added to plan",
    refresh: "Re-run evidence",
    sources: "Sources",
    streaming: "Searching evidence…",
    waiting: "Looking for the strongest evidence…",
    error: "Evidence service warming up — retry in a moment.",
    sparkLabel: "Recent pain",
  },
  es: {
    eyebrow: "Decisión de prescripción de hoy",
    title: "Siguiente paso recomendado",
    sub: "A partir del trayecto del dolor, el expediente y una búsqueda en vivo en OpenEvidence.",
    whyNow: "Por qué ahora",
    snapshot: "Resumen",
    pod: "Día post-op",
    avgPain: "Dolor promedio 7d",
    onOpioid: "Con opioide",
    adherence: "Adherencia",
    last: "Último registro",
    nextDose: "Próxima dosis",
    of: "de",
    evidence: "Evidencia",
    evidenceLive: "En vivo de OpenEvidence",
    addToPlan: "Agregar al plan",
    added: "Agregado al plan",
    refresh: "Buscar de nuevo",
    sources: "Fuentes",
    streaming: "Buscando evidencia…",
    waiting: "Buscando la evidencia más fuerte…",
    error: "Servicio de evidencia iniciando — intente de nuevo.",
    sparkLabel: "Dolor reciente",
  },
};

function recentMeanPain(chart: PatientChart, days = 7): number {
  const cutoff = chart.meta.todayPod - days;
  const recent = chart.pain.filter((p) => p.pod >= cutoff);
  if (recent.length === 0) return 0;
  return recent.reduce((s, p) => s + p.level, 0) / recent.length;
}

function adherencePct(chart: PatientChart): number {
  const scheduled = chart.doses.filter((d) => d.scheduled);
  if (scheduled.length === 0) return 100;
  const taken = scheduled.filter((d) => d.taken).length;
  return Math.round((taken / scheduled.length) * 100);
}

function lastLogRelative(chart: PatientChart, locale: Locale): string {
  const all = [
    ...chart.pain.map((p) => p.timestamp),
    ...chart.doses.map((d) => d.timestamp),
    ...chart.walks.map((w) => w.timestamp),
  ].sort();
  const latest = all[all.length - 1];
  if (!latest) return "—";
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(latest).getTime()) / 60000),
  );
  if (minutes < 60)
    return locale === "es" ? `hace ${minutes} min` : `${minutes} min ago`;
  const hrs = Math.round(minutes / 60);
  if (hrs < 24) return locale === "es" ? `hace ${hrs} h` : `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return locale === "es" ? `hace ${days} d` : `${days} d ago`;
}

export function PrescribingHero({
  recommendation,
  chart,
  signals,
  locale,
  patientId,
  planItems,
  onPlanChange,
}: PrescribingHeroProps) {
  const c = HERO_COPY[locale];
  const [state, setState] = useState<EvidenceState>(EMPTY);
  const abortRef = useRef<AbortController | null>(null);

  const sparkPoints = useMemo(() => {
    const cutoff = chart.meta.todayPod - 7;
    return chart.pain
      .filter((p) => p.pod >= cutoff)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((p) => p.level);
  }, [chart]);

  const stats = useMemo(
    () => ({
      pod: chart.meta.todayPod,
      avgPain: recentMeanPain(chart).toFixed(1),
      adherence: adherencePct(chart),
      lastLog: lastLogRelative(chart, locale),
    }),
    [chart, locale],
  );

  const relatedSignals = useMemo(
    () =>
      signals.filter((s) => recommendation.relatedSignalIds.includes(s.id)),
    [signals, recommendation.relatedSignalIds],
  );

  const runEvidence = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState({ ...EMPTY, loading: true });

    try {
      const res = await fetch(ENDPOINTS.rxRationale, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendation,
          context: { patientChart: chart, signals },
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        setState({ ...EMPTY, error: c.error });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const ev = parseContractEvent(line);
          if (!ev) continue;
          setState((cur) => {
            if (ev.type === "text_delta")
              return { ...cur, text: cur.text + ev.text };
            if (ev.type === "searching")
              return { ...cur, searching: ev.query };
            if (ev.type === "done")
              return {
                ...cur,
                loading: false,
                citations: ev.citations,
                searching: "",
              };
            if (ev.type === "error")
              return { ...cur, loading: false, error: ev.error };
            return cur;
          });
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState({ ...EMPTY, error: c.error });
    }
  }, [recommendation, chart, signals, c.error]);

  // Auto-fire whenever the recommendation changes. React 19 StrictMode
  // double-invokes this effect in dev; runEvidence already aborts the
  // previous in-flight request before starting a new one, so the second
  // invocation cleanly replaces the first.
  useEffect(() => {
    void runEvidence();
    return () => abortRef.current?.abort();
  }, [runEvidence]);

  const added = planItems.some((p) => p.id === recommendation.id);

  function addToPlan() {
    const item: PlanItem = {
      id: recommendation.id,
      recommendationId: recommendation.id,
      drug: recommendation.drug,
      dose: recommendation.dose,
      duration: recommendation.duration,
      reason: recommendation.relatedSignalIds[0] ?? "ai",
      addedAtIso: new Date().toISOString(),
    };
    onPlanChange(addPlanItem(patientId, item));
  }

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-sp-teal-200 shadow-[0_1px_2px_rgba(15,55,75,0.06),0_24px_48px_-24px_rgba(15,118,110,0.22)]"
      aria-label={c.title}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-sp-teal-50 via-white to-white"
      />
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sp-teal-100/60 blur-3xl"
      />

      <div className="relative px-6 sm:px-8 pt-6 pb-7">
        <header className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-sp-teal-700 font-semibold m-0 flex items-center gap-2">
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-sp-teal-600 animate-pulse" />
              {c.eyebrow}
            </p>
            <h2 className="text-[22px] sm:text-[24px] font-semibold text-sp-ink m-0 mt-1.5 tracking-[-0.015em]">
              {c.title}
            </h2>
            <p className="text-[13px] text-sp-muted m-0 mt-1 max-w-[60ch]">
              {c.sub}
            </p>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* LEFT: the prescription itself */}
          <div className="rounded-lg bg-white/85 backdrop-blur-sm border border-sp-teal-100 p-5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.1em] text-sp-teal-700 font-semibold bg-sp-teal-50 border border-sp-teal-100 rounded px-1.5 py-0.5">
                {t(copy.provider.rxKindAdjunct, locale).toUpperCase()}
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-sp-muted">
                POD {stats.pod}
              </span>
            </div>
            <h3 className="text-[26px] sm:text-[30px] font-semibold text-sp-ink m-0 mt-2 tracking-[-0.02em] leading-tight">
              {recommendation.drug}
            </h3>
            <p className="m-0 mt-1.5 font-mono text-[14px] text-sp-text">
              {recommendation.dose}
              <span className="text-sp-subtle"> · </span>
              <span className="text-sp-muted">{recommendation.duration}</span>
            </p>

            <p className="m-0 mt-3 text-[13.5px] text-sp-text leading-relaxed">
              {recommendation.rationale[locale]}
            </p>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={addToPlan}
                disabled={added}
                className={`inline-flex items-center gap-2 rounded-md text-[13px] font-semibold px-4 py-2.5 transition shadow-sm ${
                  added
                    ? "bg-sp-success-bg text-sp-success border border-green-200 cursor-default"
                    : "bg-sp-teal-700 text-white hover:bg-sp-teal-800"
                }`}
              >
                {added ? (
                  <>
                    <Check />
                    {c.added}
                  </>
                ) : (
                  <>
                    <Plus />
                    {c.addToPlan}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => runEvidence()}
                disabled={state.loading}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium rounded-md px-3 py-2 border border-sp-line text-sp-text hover:bg-sp-canvas disabled:opacity-60"
              >
                <Refresh />
                {c.refresh}
              </button>
            </div>
          </div>

          {/* RIGHT: why now */}
          <div className="rounded-lg bg-white/70 backdrop-blur-sm border border-sp-teal-100 p-5">
            <p className="text-[10px] uppercase tracking-[0.12em] text-sp-subtle font-semibold m-0">
              {c.whyNow}
            </p>
            <ul className="mt-2.5 space-y-2 m-0 p-0 list-none">
              {relatedSignals.length === 0 && (
                <li className="text-[12.5px] text-sp-muted">
                  {recommendation.rationale[locale].split(".")[0]}
                </li>
              )}
              {relatedSignals.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start gap-2 text-[13px] text-sp-text"
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      s.severity === "critical"
                        ? "bg-sp-danger"
                        : s.severity === "warn"
                          ? "bg-sp-warn"
                          : "bg-sp-teal-600"
                    }`}
                  />
                  <span>
                    <span className="font-semibold text-sp-ink">
                      {s.title[locale]}
                    </span>
                    <span className="text-sp-muted"> · {s.detail[locale]}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-sp-line-soft">
              <p className="text-[10px] uppercase tracking-[0.12em] text-sp-subtle font-semibold m-0 mb-1.5">
                {c.sparkLabel}
              </p>
              <Sparkline points={sparkPoints} />
              <div className="grid grid-cols-3 gap-3 mt-3 text-[12px]">
                <Stat label={c.avgPain} value={`${stats.avgPain}/10`} />
                <Stat label={c.adherence} value={`${stats.adherence}%`} />
                <Stat label={c.last} value={stats.lastLog} />
              </div>
            </div>
          </div>
        </div>

        {/* Evidence block — full width below */}
        <div className="mt-5 rounded-lg border border-sp-teal-100 bg-white">
          <div className="flex items-center justify-between px-5 py-3 border-b border-sp-line-soft">
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-sp-teal-800 font-semibold m-0">
                {c.evidence}
              </p>
              <span className="text-[10px] uppercase tracking-[0.08em] text-sp-muted bg-sp-canvas border border-sp-line rounded px-1.5 py-0.5">
                {c.evidenceLive}
              </span>
            </div>
            {state.loading && (
              <span className="text-[11px] text-sp-muted flex items-center gap-1.5">
                <Spinner />
                {state.searching ? state.searching : c.streaming}
              </span>
            )}
          </div>

          <div className="px-5 py-4 text-[13px] text-sp-text leading-relaxed min-h-[80px]">
            {!state.text && !state.error && state.loading && (
              <SkeletonLines />
            )}
            {state.error && (
              <p className="text-sp-danger m-0">{state.error}</p>
            )}
            {state.text && (
              <CitedMarkdown text={state.text} citations={state.citations} />
            )}
            <SourceList citations={state.citations} label={c.sources} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <div className="h-10 flex items-center text-[11px] text-sp-subtle italic">
        not enough data
      </div>
    );
  }
  const w = 220;
  const h = 40;
  const min = 0;
  const max = 10;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = points[points.length - 1]!;
  const lastX = (points.length - 1) * step;
  const lastY = h - ((last - min) / (max - min)) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--sp-teal-300)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--sp-teal-300)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path
        d={path}
        fill="none"
        stroke="var(--sp-teal-700)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill="var(--sp-teal-700)" />
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0">
        {label}
      </p>
      <p className="text-[13px] font-semibold text-sp-ink m-0 mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2">
      <div className="h-3 rounded bg-sp-line/70 w-[80%] animate-pulse" />
      <div className="h-3 rounded bg-sp-line/60 w-[92%] animate-pulse" />
      <div className="h-3 rounded bg-sp-line/50 w-[60%] animate-pulse" />
    </div>
  );
}

function Plus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 2v10M2 7h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7.5l3 3 5-6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Refresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.2 8.2a5 5 0 0 0 9.6-1m.2-3.4A5 5 0 0 0 2.4 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 1.5v3h-3M2 12.5v-3h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border-[1.5px] border-sp-teal-200 border-t-sp-teal-700 animate-spin"
      aria-hidden
    />
  );
}

