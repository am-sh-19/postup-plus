"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import type { Locale, Signal, SignalSeverity } from "@/lib/types";

interface SignalsPanelProps {
  signals: Signal[];
  locale: Locale;
  onFocus?: (signal: Signal) => void;
}

const SEVERITY: Record<
  SignalSeverity,
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

const VISIBLE_TOP = 3;

export function SignalsPanel({ signals, locale, onFocus }: SignalsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? signals : signals.slice(0, VISIBLE_TOP);
  const hidden = Math.max(0, signals.length - VISIBLE_TOP);

  return (
    <section
      className="bg-white rounded-lg border border-sp-line h-full flex flex-col"
      aria-label="Signal alerts"
    >
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-sp-line-soft">
        <h3 className="text-[11px] uppercase tracking-[0.08em] text-sp-subtle font-semibold m-0">
          {t(copy.provider.signalsTitle, locale)}
        </h3>
        {signals.length > 0 && (
          <span className="text-[11px] font-semibold text-sp-teal-800 bg-sp-teal-50 border border-sp-teal-100 rounded-full px-2 py-0.5">
            {signals.length} {t(copy.provider.signalsActive, locale)}
          </span>
        )}
      </header>

      {signals.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-sp-muted text-sm py-8">
          <span className="text-sp-success font-medium">
            ✓ {t(copy.provider.signalsEmpty, locale)}
          </span>
        </div>
      )}

      {signals.length > 0 && (
        <ul className="flex-1 overflow-y-auto m-0 p-0 list-none divide-y divide-sp-line-soft">
          {visible.map((sig) => {
            const sev = SEVERITY[sig.severity];
            return (
              <li key={sig.id}>
                <button
                  type="button"
                  onClick={() => onFocus?.(sig)}
                  className={`relative w-full text-left px-5 py-3 pl-7 hover:bg-sp-canvas transition before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r ${sev.rail}`}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-0.5">
                    <span className="text-[13px] font-semibold text-sp-ink leading-tight">
                      {sig.title[locale]}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] uppercase tracking-[0.06em] font-semibold rounded px-1.5 py-0.5 border ${sev.chip}`}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-sp-text m-0 leading-snug">
                    {sig.detail[locale]}
                  </p>
                  {sig.expected && (
                    <p className="text-[11px] text-sp-muted m-0 mt-0.5">
                      {sig.expected[locale]}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-[11px] font-semibold text-sp-teal-700 hover:text-sp-teal-800 px-5 py-2 text-left border-t border-sp-line-soft"
        >
          {expanded
            ? "▲ Show fewer"
            : `+${hidden} ${t(copy.provider.signalsMore, locale)}`}
        </button>
      )}
    </section>
  );
}
