"use client";

import { useCallback, useState } from "react";
import {
  ENDPOINTS,
  parseContractEvent,
  type ContractCitation,
} from "@/lib/ai-contract";
import { copy, t } from "@/lib/copy";
import type { Locale, PatientChart, Signal } from "@/lib/types";

interface EvidenceSearchProps {
  chart: PatientChart;
  signals: Signal[];
  locale: Locale;
}

const SEED_QUERIES: Record<Locale, string[]> = {
  en: [
    "first-line adjunct for plateaued post-ACL pain at POD 7",
    "low-dose gabapentin for neuropathic post-op pain",
    "NSAID after ACL reconstruction — bleeding and healing data",
  ],
  es: [
    "adyuvante de primera línea para meseta post-ACL en POD 7",
    "gabapentina a dosis baja para dolor postoperatorio neuropático",
    "AINE post reconstrucción ACL — datos de sangrado",
  ],
};

interface SearchState {
  loading: boolean;
  text: string;
  citations: ContractCitation[];
  error: string | null;
  searching: string;
}

const EMPTY: SearchState = {
  loading: false,
  text: "",
  citations: [],
  error: null,
  searching: "",
};

export function EvidenceSearch({ chart, signals, locale }: EvidenceSearchProps) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>(EMPTY);

  const run = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setState({ ...EMPTY, loading: true });

      try {
        const res = await fetch(ENDPOINTS.clinicalLookup, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            context: { patientChart: chart, signals },
          }),
        });

        if (!res.ok || !res.body) {
          setState({
            ...EMPTY,
            error: t(copy.provider.evidenceServiceWarming, locale),
          });
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
              if (ev.type === "text_delta") {
                return { ...cur, text: cur.text + ev.text };
              }
              if (ev.type === "searching") {
                return { ...cur, searching: ev.query };
              }
              if (ev.type === "done") {
                return {
                  ...cur,
                  loading: false,
                  citations: ev.citations,
                  searching: "",
                };
              }
              if (ev.type === "error") {
                return { ...cur, loading: false, error: ev.error };
              }
              return cur;
            });
          }
        }
      } catch (err) {
        setState({
          ...EMPTY,
          error:
            err instanceof Error
              ? err.message
              : t(copy.provider.evidenceServiceWarming, locale),
        });
      }
    },
    [chart, signals, locale],
  );

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="Evidence search"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-postup-navy m-0">
          🔎 {t(copy.provider.evidenceTitle, locale)}
        </h3>
        <p className="text-xs text-postup-muted m-0 mt-0.5">
          {t(copy.provider.evidenceHint, locale)}
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="flex gap-2 mb-3"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(copy.provider.evidencePlaceholder, locale)}
          className="flex-1 rounded-full border border-[#c5d4e8] bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-postup-blue"
        />
        <button
          type="submit"
          disabled={state.loading}
          className="rounded-full bg-postup-blue text-white text-sm font-semibold px-5 py-2.5 hover:bg-postup-blue-dark disabled:opacity-60"
        >
          {state.loading
            ? t(copy.provider.evidenceSearching, locale)
            : t(copy.provider.evidenceSearch, locale)}
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] uppercase tracking-wider text-postup-muted font-semibold pt-1">
          {t(copy.provider.evidenceSuggested, locale)}:
        </span>
        {SEED_QUERIES[locale].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuery(q);
              run(q);
            }}
            className="text-[11px] rounded-full bg-postup-bg border border-[var(--postup-border)] px-2.5 py-1 text-postup-navy hover:bg-postup-soft"
          >
            {q}
          </button>
        ))}
      </div>

      {(state.text || state.searching || state.error || state.citations.length > 0) && (
        <div className="rounded-xl bg-postup-bg/60 border border-[var(--postup-border)] p-4 text-[13px] text-postup-navy/90 leading-relaxed">
          {state.searching && (
            <p className="text-postup-muted text-xs m-0 mb-2">
              🔍 {state.searching}
            </p>
          )}
          {state.error && (
            <p className="text-orange-600 m-0">{state.error}</p>
          )}
          {state.text && (
            <CitedMarkdown text={state.text} citations={state.citations} />
          )}
          {state.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--postup-border)]">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-postup-muted m-0 mb-1.5">
                {t(copy.provider.evidenceSources, locale)}
              </p>
              <ol className="m-0 pl-4 space-y-0.5 text-[12px]">
                {state.citations.map((c, i) => (
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
          )}
        </div>
      )}
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
