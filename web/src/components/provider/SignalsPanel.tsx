"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import type { Locale, Signal, SignalSeverity } from "@/lib/types";

interface SignalsPanelProps {
  signals: Signal[];
  locale: Locale;
  onFocus?: (signal: Signal) => void;
}

const SEVERITY_STYLES: Record<
  SignalSeverity,
  { dot: string; border: string; bg: string; text: string; emoji: string }
> = {
  critical: {
    dot: "bg-red-500",
    border: "border-l-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    emoji: "🔴",
  },
  warn: {
    dot: "bg-orange-500",
    border: "border-l-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    emoji: "🟠",
  },
  info: {
    dot: "bg-yellow-500",
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    emoji: "🟡",
  },
};

const VISIBLE_TOP = 3;

export function SignalsPanel({ signals, locale, onFocus }: SignalsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? signals : signals.slice(0, VISIBLE_TOP);
  const hidden = Math.max(0, signals.length - VISIBLE_TOP);

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60 h-full flex flex-col"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="Signal alerts"
    >
      <header className="flex items-baseline justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-postup-muted font-semibold">
          ⚠ {t(copy.provider.signalsTitle, locale)}
        </span>
        {signals.length > 0 && (
          <span className="text-[11px] font-semibold text-postup-blue bg-postup-soft rounded-full px-2.5 py-0.5">
            {signals.length} {t(copy.provider.signalsActive, locale)}
          </span>
        )}
      </header>

      {signals.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-postup-muted text-sm">
          <span className="text-2xl mr-2">✅</span>
          {t(copy.provider.signalsEmpty, locale)}
        </div>
      )}

      {signals.length > 0 && (
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {visible.map((sig) => {
            const style = SEVERITY_STYLES[sig.severity];
            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => onFocus?.(sig)}
                className={`w-full text-left rounded-xl border-l-[3px] ${style.border} ${style.bg} px-3 py-2.5 hover:brightness-95 transition`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-postup-navy">
                    {style.emoji} {sig.title[locale]}
                  </span>
                </div>
                <p className="text-xs text-postup-navy/80 mt-1 m-0 leading-snug">
                  {sig.detail[locale]}
                </p>
                {sig.expected && (
                  <p className="text-[11px] text-postup-muted italic mt-1 m-0">
                    {sig.expected[locale]}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 text-xs font-semibold text-postup-blue hover:underline self-start"
        >
          {expanded ? "▲" : `+${hidden} ${t(copy.provider.signalsMore, locale)} ▾`}
        </button>
      )}
    </section>
  );
}
