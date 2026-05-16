"use client";

import { useCallback, useState } from "react";
import {
  ENDPOINTS,
  parseContractEvent,
  type ContractCitation,
} from "@/lib/ai-contract";
import { copy, t } from "@/lib/copy";
import { addPlanItem } from "@/lib/plan-store";
import type {
  Locale,
  PatientChart,
  PatientId,
  PlanItem,
  RecommendationKind,
  RxRecommendation,
  Signal,
} from "@/lib/types";

interface RxRecommendationsProps {
  recommendations: RxRecommendation[];
  signals: Signal[];
  chart: PatientChart;
  locale: Locale;
  patientId: PatientId;
  onPlanChange: (items: PlanItem[]) => void;
  planItems: PlanItem[];
}

const KIND_STYLE: Record<RecommendationKind, { label: keyof typeof copy.provider; pill: string }> = {
  primary: { label: "rxKindPrimary", pill: "bg-postup-blue text-white" },
  adjunct: { label: "rxKindAdjunct", pill: "bg-postup-soft text-postup-blue-dark" },
  taper: { label: "rxKindTaper", pill: "bg-postup-move-soft text-postup-green-dark" },
  "non-pharm": {
    label: "rxKindNonPharm",
    pill: "bg-amber-100 text-amber-700",
  },
};

interface RationaleState {
  loading: boolean;
  text: string;
  citations: ContractCitation[];
  error: string | null;
  searching: string;
}

const EMPTY_RATIONALE: RationaleState = {
  loading: false,
  text: "",
  citations: [],
  error: null,
  searching: "",
};

export function RxRecommendations({
  recommendations,
  signals,
  chart,
  locale,
  patientId,
  onPlanChange,
  planItems,
}: RxRecommendationsProps) {
  const [open, setOpen] = useState<Record<string, RationaleState>>({});

  const fetchRationale = useCallback(
    async (rec: RxRecommendation) => {
      setOpen((s) => ({
        ...s,
        [rec.id]: { ...EMPTY_RATIONALE, loading: true },
      }));

      try {
        const res = await fetch(ENDPOINTS.rxRationale, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recommendation: rec,
            context: { patientChart: chart, signals },
          }),
        });

        if (!res.ok || !res.body) {
          setOpen((s) => ({
            ...s,
            [rec.id]: {
              ...EMPTY_RATIONALE,
              error: t(copy.provider.rxServiceWarming, locale),
            },
          }));
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
            setOpen((s) => {
              const cur = s[rec.id] ?? EMPTY_RATIONALE;
              if (ev.type === "text_delta") {
                return { ...s, [rec.id]: { ...cur, text: cur.text + ev.text } };
              }
              if (ev.type === "searching") {
                return { ...s, [rec.id]: { ...cur, searching: ev.query } };
              }
              if (ev.type === "done") {
                return {
                  ...s,
                  [rec.id]: {
                    ...cur,
                    loading: false,
                    citations: ev.citations,
                    searching: "",
                  },
                };
              }
              if (ev.type === "error") {
                return {
                  ...s,
                  [rec.id]: { ...cur, loading: false, error: ev.error },
                };
              }
              return s;
            });
          }
        }
      } catch (err) {
        setOpen((s) => ({
          ...s,
          [rec.id]: {
            ...EMPTY_RATIONALE,
            error: err instanceof Error ? err.message : t(copy.provider.rxServiceWarming, locale),
          },
        }));
      }
    },
    [chart, signals, locale],
  );

  function toggleWhy(rec: RxRecommendation) {
    if (open[rec.id]) {
      setOpen((s) => {
        const { [rec.id]: _, ...rest } = s;
        return rest;
      });
      return;
    }
    fetchRationale(rec);
  }

  function addToPlan(rec: RxRecommendation) {
    const item: PlanItem = {
      id: rec.id,
      recommendationId: rec.id,
      drug: rec.drug,
      dose: rec.dose,
      duration: rec.duration,
      reason:
        rec.relatedSignalIds[0] ??
        (rec.kind === "non-pharm" ? "non-pharm" : "ai"),
      addedAtIso: new Date().toISOString(),
    };
    const next = addPlanItem(patientId, item);
    onPlanChange(next);
  }

  const inPlan = new Set(planItems.map((p) => p.id));

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="AI recommendations"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-postup-navy m-0">
          ✨ {t(copy.provider.rxTitle, locale)}
        </h3>
        <p className="text-xs text-postup-muted m-0 mt-0.5">
          {t(copy.provider.rxSubtitle, locale)}
        </p>
      </header>

      {recommendations.length === 0 && (
        <p className="text-sm text-postup-muted">
          {t(copy.provider.rxEmpty, locale)}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {recommendations.map((rec) => {
          const isOpen = !!open[rec.id];
          const state = open[rec.id] ?? EMPTY_RATIONALE;
          const added = inPlan.has(rec.id);
          const kindMeta = KIND_STYLE[rec.kind];
          return (
            <article
              key={rec.id}
              className="rounded-2xl bg-postup-bg border border-[var(--postup-border)] p-4 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-[15px] font-semibold text-postup-navy m-0">
                  {rec.drug}
                </h4>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${kindMeta.pill}`}
                >
                  {t(copy.provider[kindMeta.label], locale)}
                </span>
              </div>
              <p className="text-sm text-postup-navy/85 m-0 mb-0.5">{rec.dose}</p>
              <p className="text-[11px] text-postup-muted m-0 mb-2.5">
                {rec.duration}
              </p>

              <p className="text-[12px] text-postup-navy/85 leading-snug border-l-2 border-postup-blue/40 pl-2.5 mb-3">
                {rec.rationale[locale]}
              </p>

              <div className="flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => addToPlan(rec)}
                  disabled={added}
                  className={`flex-1 text-xs font-semibold rounded-full py-2 transition ${
                    added
                      ? "bg-postup-move-soft text-postup-green-dark cursor-default"
                      : "bg-postup-blue text-white hover:bg-postup-blue-dark"
                  }`}
                >
                  {added ? `✓ ${t(copy.provider.rxAdded, locale)}` : `+ ${t(copy.provider.rxAdd, locale)}`}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWhy(rec)}
                  className="text-xs font-semibold rounded-full px-3 py-2 border border-[var(--postup-border)] text-postup-navy hover:bg-white"
                >
                  {isOpen ? t(copy.provider.rxHide, locale) : t(copy.provider.rxWhy, locale)}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 rounded-xl bg-white border border-[var(--postup-border)] p-3 text-[12px] text-postup-navy/85 leading-relaxed">
                  {state.loading && !state.text && (
                    <p className="text-postup-muted m-0">
                      {state.searching
                        ? `🔍 ${state.searching}`
                        : t(copy.provider.evidenceSearching, locale)}
                    </p>
                  )}
                  {state.error && (
                    <p className="text-orange-600 m-0">{state.error}</p>
                  )}
                  {state.text && (
                    <CitedMarkdown text={state.text} citations={state.citations} />
                  )}
                  {state.citations.length > 0 && (
                    <CitationList citations={state.citations} locale={locale} />
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CitedMarkdown({
  text,
  citations,
}: {
  text: string;
  citations: ContractCitation[];
}) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (m) {
          const num = parseInt(m[1]!, 10);
          const cite = citations[num - 1];
          if (cite) {
            return (
              <a
                key={i}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-postup-blue underline-offset-2 hover:underline mx-0.5 text-[11px] font-semibold align-super"
              >
                [{num}]
              </a>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function CitationList({
  citations,
  locale,
}: {
  citations: ContractCitation[];
  locale: Locale;
}) {
  return (
    <div className="mt-3 pt-3 border-t border-[var(--postup-border)]">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-postup-muted m-0 mb-1.5">
        {t(copy.provider.evidenceSources, locale)}
      </p>
      <ol className="m-0 pl-4 space-y-0.5 text-[11px]">
        {citations.map((c, i) => (
          <li key={c.url} className="text-postup-muted">
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-postup-blue hover:underline"
            >
              [{i + 1}] {c.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
