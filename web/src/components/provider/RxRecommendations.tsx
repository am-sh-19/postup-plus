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

const KIND_STYLE: Record<
  RecommendationKind,
  { labelKey: keyof typeof copy.provider; chip: string }
> = {
  primary: {
    labelKey: "rxKindPrimary",
    chip: "bg-sp-teal-50 text-sp-teal-800 border-sp-teal-100",
  },
  adjunct: {
    labelKey: "rxKindAdjunct",
    chip: "bg-sp-info-bg text-sp-info border-gray-200",
  },
  taper: {
    labelKey: "rxKindTaper",
    chip: "bg-sp-success-bg text-sp-success border-green-200",
  },
  "non-pharm": {
    labelKey: "rxKindNonPharm",
    chip: "bg-sp-warn-bg text-sp-warn border-amber-200",
  },
};

interface RationaleState {
  loading: boolean;
  text: string;
  citations: ContractCitation[];
  error: string | null;
  searching: string;
}

const EMPTY: RationaleState = {
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
      setOpen((s) => ({ ...s, [rec.id]: { ...EMPTY, loading: true } }));
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
              ...EMPTY,
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
              const cur = s[rec.id] ?? EMPTY;
              if (ev.type === "text_delta")
                return { ...s, [rec.id]: { ...cur, text: cur.text + ev.text } };
              if (ev.type === "searching")
                return { ...s, [rec.id]: { ...cur, searching: ev.query } };
              if (ev.type === "done")
                return {
                  ...s,
                  [rec.id]: {
                    ...cur,
                    loading: false,
                    citations: ev.citations,
                    searching: "",
                  },
                };
              if (ev.type === "error")
                return {
                  ...s,
                  [rec.id]: { ...cur, loading: false, error: ev.error },
                };
              return s;
            });
          }
        }
      } catch (err) {
        setOpen((s) => ({
          ...s,
          [rec.id]: {
            ...EMPTY,
            error:
              err instanceof Error
                ? err.message
                : t(copy.provider.rxServiceWarming, locale),
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
      reason: rec.relatedSignalIds[0] ?? (rec.kind === "non-pharm" ? "non-pharm" : "ai"),
      addedAtIso: new Date().toISOString(),
    };
    onPlanChange(addPlanItem(patientId, item));
  }

  const inPlan = new Set(planItems.map((p) => p.id));

  return (
    <section
      className="bg-white rounded-lg border border-sp-line"
      aria-label="AI recommendations"
    >
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-sp-line-soft">
        <div>
          <h3 className="text-[15px] font-semibold text-sp-ink m-0 tracking-tight">
            {t(copy.provider.rxTitle, locale)}
          </h3>
          <p className="text-[12px] text-sp-muted m-0 mt-0.5">
            {t(copy.provider.rxSubtitle, locale)}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.08em] text-sp-teal-700 bg-sp-teal-50 border border-sp-teal-100 rounded px-2 py-0.5">
          AI
        </span>
      </header>

      {recommendations.length === 0 && (
        <p className="text-sm text-sp-muted px-5 py-6 m-0">
          {t(copy.provider.rxEmpty, locale)}
        </p>
      )}

      <ul className="m-0 p-0 list-none divide-y divide-sp-line-soft">
        {recommendations.map((rec) => {
          const state = open[rec.id] ?? EMPTY;
          const isOpen = !!open[rec.id];
          const added = inPlan.has(rec.id);
          const kindMeta = KIND_STYLE[rec.kind];

          return (
            <li key={rec.id} className="px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[15px] font-semibold text-sp-ink m-0">
                      {rec.drug}
                    </h4>
                    <span
                      className={`text-[10px] uppercase tracking-[0.06em] font-semibold rounded px-1.5 py-0.5 border ${kindMeta.chip}`}
                    >
                      {t(copy.provider[kindMeta.labelKey], locale)}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-[13px] text-sp-text font-mono">
                    {rec.dose}
                    <span className="text-sp-subtle"> · </span>
                    <span className="text-sp-muted">{rec.duration}</span>
                  </p>
                  <p className="text-[13px] text-sp-text leading-relaxed m-0 mt-2">
                    {rec.rationale[locale]}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-1.5 w-32">
                  <button
                    type="button"
                    onClick={() => addToPlan(rec)}
                    disabled={added}
                    className={`text-[12px] font-medium rounded-md py-1.5 px-3 transition ${
                      added
                        ? "bg-sp-success-bg text-sp-success border border-green-200 cursor-default"
                        : "bg-sp-teal-600 text-white hover:bg-sp-teal-700"
                    }`}
                  >
                    {added
                      ? `✓ ${t(copy.provider.rxAdded, locale)}`
                      : t(copy.provider.rxAdd, locale)}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWhy(rec)}
                    className="text-[12px] font-medium rounded-md py-1.5 px-3 border border-sp-line text-sp-text hover:bg-sp-canvas"
                  >
                    {isOpen
                      ? t(copy.provider.rxHide, locale)
                      : t(copy.provider.rxWhy, locale)}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 rounded-md border border-sp-line bg-sp-canvas p-4 text-[12.5px] text-sp-text leading-relaxed">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0 mb-2">
                    Evidence
                  </p>
                  {state.loading && !state.text && (
                    <p className="text-sp-muted m-0">
                      {state.searching
                        ? `Searching · ${state.searching}`
                        : t(copy.provider.evidenceSearching, locale)}
                    </p>
                  )}
                  {state.error && (
                    <p className="text-sp-danger m-0">{state.error}</p>
                  )}
                  {state.text && (
                    <CitedMarkdown text={state.text} citations={state.citations} />
                  )}
                  {state.citations.length > 0 && (
                    <CitationList citations={state.citations} locale={locale} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
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
                className="text-sp-teal-700 hover:underline mx-0.5 text-[11px] font-semibold align-super"
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
    <div className="mt-3 pt-3 border-t border-sp-line">
      <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-sp-subtle m-0 mb-1.5">
        {t(copy.provider.evidenceSources, locale)}
      </p>
      <ol className="m-0 pl-4 space-y-0.5 text-[11.5px]">
        {citations.map((c, i) => (
          <li key={c.url} className="text-sp-muted">
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sp-teal-700 hover:underline"
            >
              [{i + 1}] {c.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
