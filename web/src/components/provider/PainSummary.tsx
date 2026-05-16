"use client";

import { useCallback, useEffect, useState } from "react";
import { copy, t } from "@/lib/copy";
import type {
  Concern,
  ConcernSeverity,
  Locale,
  PatientId,
  PatientInsights,
  Sentiment,
  SentimentPoint,
} from "@/lib/types";

interface PainSummaryProps {
  patientId: PatientId;
  locale: Locale;
}

type Status = "idle" | "loading" | "ready" | "empty" | "error";

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  "very-negative": "bg-sp-danger",
  negative: "bg-orange-500",
  neutral: "bg-sp-subtle",
  positive: "bg-sp-teal-500",
  "very-positive": "bg-sp-success",
};

const SENTIMENT_LABEL: Record<Sentiment, { en: string; es: string }> = {
  "very-negative": { en: "Very low", es: "Muy bajo" },
  negative: { en: "Low", es: "Bajo" },
  neutral: { en: "Neutral", es: "Neutral" },
  positive: { en: "Steady", es: "Estable" },
  "very-positive": { en: "Encouraged", es: "Animado" },
};

const CONCERN_STYLE: Record<
  ConcernSeverity,
  { rail: string; chip: string; label: string }
> = {
  critical: {
    rail: "before:bg-sp-danger",
    chip: "bg-sp-danger-bg text-sp-danger border-red-200",
    label: "Critical",
  },
  warn: {
    rail: "before:bg-sp-warn",
    chip: "bg-sp-warn-bg text-sp-warn border-amber-200",
    label: "Warning",
  },
  info: {
    rail: "before:bg-sp-info",
    chip: "bg-sp-info-bg text-sp-info border-gray-200",
    label: "Info",
  },
};

export function PainSummary({ patientId, locale }: PainSummaryProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [insights, setInsights] = useState<PatientInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/insights/${patientId}`, {
        cache: "no-store",
      });
      if (res.status === 404) {
        setStatus("empty");
        setInsights(null);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `HTTP ${res.status}`);
        setStatus("error");
        return;
      }
      const data = (await res.json()) as PatientInsights;
      setInsights(data);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setStatus("error");
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0">
            {t(copy.provider.tabSummary, locale)}
          </p>
          <h2 className="text-[18px] font-semibold text-sp-ink m-0 mt-0.5 tracking-[-0.01em]">
            {t(copy.provider.summarySubtitle, locale)}
          </h2>
          {status === "ready" && insights && (
            <p className="text-[11px] text-sp-muted m-0 mt-1">
              {t(copy.provider.summaryBasedOn, locale)} {insights.basedOnTurns}{" "}
              {t(copy.provider.summaryTurns, locale)} · POD{" "}
              {insights.basedOnPodRange.start}–{insights.basedOnPodRange.end}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={status === "loading"}
          className="text-[12px] font-medium rounded-md border border-sp-line text-sp-text px-3 py-1.5 hover:bg-sp-canvas disabled:opacity-50"
        >
          {status === "loading"
            ? t(copy.provider.summaryRegenerating, locale)
            : t(copy.provider.summaryRefresh, locale)}
        </button>
      </header>

      {status === "loading" && !insights && <LoadingState locale={locale} />}
      {status === "empty" && <EmptyState locale={locale} />}
      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-sp-danger-bg p-4 text-[13px] text-sp-danger">
          {t(copy.provider.summaryError, locale)}
          {error && <span className="block text-[11px] mt-1">{error}</span>}
        </div>
      )}

      {status === "ready" && insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <NarrativeCard insights={insights} locale={locale} />
            <PainNarrativeCard insights={insights} locale={locale} />
            <QuotesCard insights={insights} locale={locale} />
            <ConcernsCard insights={insights} locale={locale} />
          </div>
          <div className="space-y-4">
            <SentimentCard insights={insights} locale={locale} />
            <MoodCard insights={insights} locale={locale} />
            <AdherenceCard insights={insights} locale={locale} />
            <NextVisitCard insights={insights} locale={locale} />
          </div>
        </div>
      )}
    </section>
  );
}

function LoadingState({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-lg border border-sp-line bg-white p-6 flex items-center gap-3 text-[13px] text-sp-muted">
      <span className="w-2 h-2 rounded-full bg-sp-teal-500 animate-pulse" />
      {t(copy.provider.summaryLoading, locale)}
    </div>
  );
}

function EmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-lg border border-dashed border-sp-line bg-white p-8 text-center">
      <p className="text-[15px] font-semibold text-sp-ink m-0">
        {t(copy.provider.summaryEmptyTitle, locale)}
      </p>
      <p className="text-[13px] text-sp-muted m-0 mt-1">
        {t(copy.provider.summaryEmptyBody, locale)}
      </p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg border border-sp-line">
      <header className="px-5 py-3 border-b border-sp-line-soft">
        <h3 className="text-[11px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0">
          {title}
        </h3>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function NarrativeCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  return (
    <Card title={t(copy.provider.summaryNarrative, locale)}>
      <p className="text-[14px] leading-relaxed text-sp-text m-0">
        {insights.narrative}
      </p>
    </Card>
  );
}

function PainNarrativeCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  const { pattern, triggers, relievers } = insights.painNarrative;
  return (
    <Card title={t(copy.provider.summaryPainPattern, locale)}>
      <p className="text-[14px] leading-relaxed text-sp-text m-0">{pattern}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-sp-subtle font-semibold m-0 mb-1.5">
            {t(copy.provider.summaryTriggers, locale)}
          </p>
          {triggers.length === 0 ? (
            <p className="text-[12px] text-sp-muted m-0">—</p>
          ) : (
            <ul className="m-0 pl-0 list-none space-y-1">
              {triggers.map((tr, i) => (
                <li
                  key={i}
                  className="text-[13px] text-sp-text flex items-start gap-2"
                >
                  <span className="text-sp-warn mt-0.5">↑</span> {tr}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-sp-subtle font-semibold m-0 mb-1.5">
            {t(copy.provider.summaryRelievers, locale)}
          </p>
          {relievers.length === 0 ? (
            <p className="text-[12px] text-sp-muted m-0">—</p>
          ) : (
            <ul className="m-0 pl-0 list-none space-y-1">
              {relievers.map((r, i) => (
                <li
                  key={i}
                  className="text-[13px] text-sp-text flex items-start gap-2"
                >
                  <span className="text-sp-success mt-0.5">↓</span> {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function SentimentCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  const overall = insights.overallSentiment;
  return (
    <Card title={t(copy.provider.summarySentimentTitle, locale)}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${SENTIMENT_COLOR[overall]}`}
        />
        <span className="text-[13px] font-medium text-sp-ink">
          {SENTIMENT_LABEL[overall][locale]}
        </span>
        <span className="text-[11px] text-sp-muted ml-auto">
          {t(copy.provider.summaryOverallLabel, locale)}
        </span>
      </div>
      <ul className="m-0 p-0 list-none space-y-1.5">
        {insights.sentimentTrend.map((pt: SentimentPoint) => (
          <li key={pt.pod} className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-sp-muted w-12">
              POD {pt.pod}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-sp-line-soft relative overflow-hidden">
              <div
                className={`absolute top-0 bottom-0 ${SENTIMENT_COLOR[pt.sentiment]}`}
                style={{
                  left: "50%",
                  width: `${Math.abs(pt.score) * 50}%`,
                  transform: pt.score < 0 ? "translateX(-100%)" : "none",
                }}
              />
              <span
                className="absolute top-0 bottom-0 w-px bg-sp-line"
                style={{ left: "50%" }}
                aria-hidden
              />
            </div>
            <span className="text-[10px] text-sp-muted w-10 text-right">
              {pt.score > 0 ? "+" : ""}
              {pt.score.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MoodCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  return (
    <Card title={t(copy.provider.summaryMoodTitle, locale)}>
      {insights.moodTags.length === 0 ? (
        <p className="text-[12px] text-sp-muted m-0">—</p>
      ) : (
        <ul className="m-0 p-0 list-none space-y-2">
          {insights.moodTags.map((tag) => (
            <li key={tag.label}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-sp-ink">{tag.label}</span>
                <span className="font-mono text-[11px] text-sp-muted">
                  {Math.round(tag.weight * 100)}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-sp-line-soft mt-1 overflow-hidden">
                <div
                  className="h-full bg-sp-teal-500"
                  style={{ width: `${Math.round(tag.weight * 100)}%` }}
                />
              </div>
              {tag.example && (
                <p className="text-[11px] italic text-sp-muted m-0 mt-1 truncate">
                  “{tag.example}”
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function QuotesCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  return (
    <Card title={t(copy.provider.summaryQuotesTitle, locale)}>
      {insights.keyQuotes.length === 0 ? (
        <p className="text-[12px] text-sp-muted m-0">—</p>
      ) : (
        <ul className="m-0 p-0 list-none space-y-3">
          {insights.keyQuotes.map((q, i) => (
            <li
              key={i}
              className="border-l-2 border-sp-teal-300 pl-3 text-[13.5px] text-sp-text leading-relaxed"
            >
              <p className="m-0">“{q.text}”</p>
              <p className="text-[11px] text-sp-muted m-0 mt-1">
                <span className="font-mono">POD {q.pod}</span>
                {q.why && <span className="ml-2">· {q.why}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ConcernsCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  if (insights.concerns.length === 0) return null;
  return (
    <Card title={t(copy.provider.summaryConcernsTitle, locale)}>
      <ul className="m-0 p-0 list-none divide-y divide-sp-line-soft -mx-5">
        {insights.concerns.map((c: Concern, i: number) => {
          const sev = CONCERN_STYLE[c.severity];
          return (
            <li
              key={i}
              className={`relative px-5 py-2.5 pl-7 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r ${sev.rail}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold text-sp-ink">
                  {c.topic}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.06em] font-semibold rounded px-1.5 py-0.5 border ${sev.chip}`}
                >
                  {sev.label} · POD {c.pod}
                </span>
              </div>
              <p className="text-[12.5px] text-sp-text m-0 mt-0.5 leading-snug">
                {c.detail}
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function AdherenceCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  if (insights.adherenceInsights.length === 0) return null;
  return (
    <Card title={t(copy.provider.summaryAdherenceTitle, locale)}>
      <ul className="m-0 pl-4 list-disc space-y-1 text-[13px] text-sp-text marker:text-sp-subtle">
        {insights.adherenceInsights.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </Card>
  );
}

function NextVisitCard({
  insights,
  locale,
}: {
  insights: PatientInsights;
  locale: Locale;
}) {
  if (insights.topicsForNextVisit.length === 0) return null;
  return (
    <Card title={t(copy.provider.summaryNextVisitTitle, locale)}>
      <ul className="m-0 p-0 list-none space-y-2">
        {insights.topicsForNextVisit.map((line, i) => (
          <li
            key={i}
            className="text-[13px] text-sp-text flex items-start gap-2"
          >
            <span className="text-sp-teal-600 mt-1 text-[8px]">●</span>
            {line}
          </li>
        ))}
      </ul>
    </Card>
  );
}
