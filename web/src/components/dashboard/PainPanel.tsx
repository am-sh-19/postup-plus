"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import { getPainScale } from "@/lib/data";
import type { Locale } from "@/lib/types";

interface PainPanelProps {
  locale: Locale;
  onSave: (level: number, label: string) => void;
}

const FUNCTIONAL = [
  {
    key: "walk",
    en: "Walk across room",
    es: "Caminar por la habitación",
  },
  { key: "sit", en: "Sit 10 min", es: "Sentarse 10 min" },
  { key: "stairs", en: "One stair", es: "Un escalón" },
] as const;

type Chip = "yes" | "help" | "no";

const PAIN_LEVELS = getPainScale();

export function PainPanel({ locale, onSave }: PainPanelProps) {
  const [level, setLevel] = useState(5);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [chips, setChips] = useState<Record<string, Chip>>({
    walk: "help",
    sit: "yes",
    stairs: "no",
  });

  const pain = PAIN_LEVELS.find((p) => p.level === level) ?? PAIN_LEVELS[4]!;

  function setChip(action: string, value: Chip) {
    setChips((c) => ({ ...c, [action]: value }));
  }

  return (
    <section className="panel p-4">
      <h2 className="text-base font-semibold m-0 text-postup-navy">
        {t(copy.dashboard.painTitle, locale)}
      </h2>
      <p className="text-postup-muted text-xs mt-1 mb-4 leading-relaxed">
        {t(copy.dashboard.painHint, locale)}
      </p>

      <div
        className="flex items-center gap-4 mb-4 p-3 rounded-[var(--postup-radius)] border border-[var(--postup-border)]"
        style={{ backgroundColor: `${pain.color}14` }}
      >
        <span
          className="flex items-center justify-center w-14 h-14 text-3xl rounded-[var(--postup-radius)] shrink-0"
          style={{ backgroundColor: `${pain.color}28` }}
          aria-hidden
        >
          {pain.emoji}
        </span>
        <div className="min-w-0">
          <div className="text-2xl font-bold leading-none tabular-nums">
            {level}
            <span className="text-sm text-postup-muted font-normal">/10</span>
          </div>
          <div
            className="font-semibold text-[15px] mt-0.5"
            style={{ color: pain.color }}
          >
            {pain.label[locale]}
          </div>
          <p className="text-xs text-postup-muted mt-1 mb-0 leading-snug">
            {pain.desc[locale]}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-5 sm:grid-cols-10 gap-1 mb-4"
        role="group"
        aria-label="Pain level 1 to 10"
      >
        {PAIN_LEVELS.map((p) => {
          const active = level === p.level;
          return (
            <button
              key={p.level}
              type="button"
              onClick={() => setLevel(p.level)}
              aria-pressed={active}
              className="flex flex-col items-center gap-0.5 py-1.5 rounded-md border transition-all"
              style={{
                borderColor: active ? p.color : "transparent",
                backgroundColor: active ? `${p.color}22` : "var(--postup-bg)",
                boxShadow: active ? `inset 0 0 0 1px ${p.color}55` : "none",
              }}
            >
              <span className="text-base leading-none">{p.emoji}</span>
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: active ? p.color : "var(--postup-muted)" }}
              >
                {p.level}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-postup-muted mb-1.5 font-medium">
          <span>{t(copy.dashboard.sliderMin, locale)}</span>
          <span>{t(copy.dashboard.sliderMax, locale)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={(e) => setLevel(+e.target.value)}
          className="pain-range"
          style={{ accentColor: pain.color }}
        />
      </div>

      <button
        type="button"
        onClick={() => setActionsOpen((o) => !o)}
        className="w-full text-left text-sm text-postup-blue font-medium mb-2 py-1"
      >
        {actionsOpen
          ? t(copy.dashboard.functionalHide, locale)
          : t(copy.dashboard.functionalToggle, locale)}
      </button>

      {actionsOpen && (
        <div className="mb-4 space-y-0 border border-[var(--postup-border)] rounded-[var(--postup-radius)] overflow-hidden">
          <div className="px-3 py-2 bg-postup-bg text-[11px] font-semibold text-postup-muted uppercase tracking-wide">
            {t(copy.dashboard.functionalTitle, locale)}
          </div>
          {FUNCTIONAL.map((row) => (
            <div
              key={row.key}
              className="flex items-center gap-2 text-sm px-3 py-2.5 border-t border-[var(--postup-border)] bg-white"
            >
              <span className="flex-1 text-postup-navy">
                {locale === "es" ? row.es : row.en}
              </span>
              <div className="flex gap-1">
                {(["yes", "help", "no"] as Chip[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChip(row.key, c)}
                    className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                      chips[row.key] === c
                        ? "bg-postup-navy text-white border-postup-navy"
                        : "border-[#c5d0de] text-postup-muted bg-white"
                    }`}
                  >
                    {c === "yes"
                      ? t(copy.dashboard.yes, locale)
                      : c === "help"
                        ? t(copy.dashboard.help, locale)
                        : t(copy.dashboard.no, locale)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onSave(level, pain.label[locale])}
        className="btn-primary"
      >
        {t(copy.dashboard.savePain, locale)}
      </button>
    </section>
  );
}
