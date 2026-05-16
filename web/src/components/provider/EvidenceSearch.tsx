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
      className="bg-white rounded-lg border border-sp-line"
      aria-label="Evidence search"
    >
      <header className="px-5 py-3 border-b border-sp-line-soft">
        <h3 className="text-[15px] font-semibold text-sp-ink m-0 tracking-tight">
          {t(copy.provider.evidenceTitle, locale)}
        </h3>
        <p className="text-[12px] text-sp-muted m-0 mt-0.5">
          {t(copy.provider.evidenceHint, locale)}
        </p>
      </header>

      <div className="px-5 py-4">
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
            className="flex-1 rounded-md border border-sp-line bg-white px-3.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-sp-teal-200 focus:border-sp-teal-500"
          />
          <button
            type="submit"
            disabled={state.loading}
            className="rounded-md bg-sp-teal-600 text-white text-[13px] font-medium px-4 py-2 hover:bg-sp-teal-700 disabled:opacity-60"
          >
            {state.loading
              ? t(copy.provider.evidenceSearching, locale)
              : t(copy.provider.evidenceSearch, locale)}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase tracking-[0.08em] text-sp-subtle font-semibold">
            {t(copy.provider.evidenceSuggested, locale)}
          </span>
          {SEED_QUERIES[locale].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setQuery(q);
                run(q);
              }}
              className="text-[11.5px] rounded-md bg-sp-canvas border border-sp-line px-2.5 py-1 text-sp-text hover:bg-sp-teal-50 hover:border-sp-teal-200 hover:text-sp-teal-800"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {(state.text || state.searching || state.error || state.citations.length > 0) && (
        <div className="border-t border-sp-line-soft bg-sp-canvas px-5 py-4 text-[13px] text-sp-text leading-relaxed">
          <p className="text-[10px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0 mb-2">
            Answer
          </p>
          {state.searching && (
            <p className="text-sp-muted text-[12px] m-0 mb-2">
              Searching · {state.searching}
            </p>
          )}
          {state.error && (
            <p className="text-sp-danger m-0">{state.error}</p>
          )}
          {state.text && (
            <CitedMarkdown text={state.text} citations={state.citations} />
          )}
          {state.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-sp-line">
              <p className="text-[10px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0 mb-1.5">
                {t(copy.provider.evidenceSources, locale)}
              </p>
              <ol className="m-0 pl-4 space-y-0.5 text-[12px]">
                {state.citations.map((c, i) => (
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
