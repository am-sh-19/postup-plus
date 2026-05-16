"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import { PAIN_LEVELS } from "@/lib/pain";
import type { Locale } from "@/lib/types";

interface PainPanelProps {
  locale: Locale;
  onSave: (level: number, label: string) => void;
}

const FUNCTIONAL = [
  { key: "walk", icon: "🚶", en: "Walk across room", es: "Caminar por la habitación" },
  { key: "sit", icon: "🪑", en: "Sit 10 min", es: "Sentarse 10 min" },
  { key: "stairs", icon: "🪜", en: "One stair", es: "Un escalón" },
] as const;

type Chip = "yes" | "help" | "no";

export function PainPanel({ locale, onSave }: PainPanelProps) {
  const [level, setLevel] = useState(5);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [chips, setChips] = useState<Record<string, Chip>>({
    walk: "help",
    sit: "yes",
    stairs: "no",
  });

  const pain = PAIN_LEVELS[level - 1]!;

  function setChip(action: string, value: Chip) {
    setChips((c) => ({ ...c, [action]: value }));
  }

  return (
    <section className="bg-white rounded-[var(--postup-rounded)] p-4 shadow-sm border border-[var(--postup-border)]/50">
      <h2 className="text-lg font-semibold m-0">
        {t(copy.dashboard.painTitle, locale)}
      </h2>
      <p className="text-postup-muted text-xs mt-1 mb-3">
        {t(copy.dashboard.painHint, locale)}
      </p>

      <div className="flex items-center gap-4 mb-3">
        <span className="text-5xl" aria-hidden>
          {pain.emoji}
        </span>
        <div>
          <div className="text-3xl font-bold leading-none">
            {level}
            <span className="text-base text-postup-muted font-normal">/10</span>
          </div>
          <div className="font-semibold text-postup-navy">
            {pain.label[locale]}
          </div>
          <div className="text-xs text-postup-muted">{pain.desc[locale]}</div>
        </div>
      </div>

      <div
        className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-3"
        role="group"
        aria-label="Pain level 1 to 10"
      >
        {PAIN_LEVELS.map((p, i) => {
          const lv = i + 1;
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              aria-pressed={level === lv}
              className={`flex flex-col items-center gap-0.5 rounded-xl border-2 py-1.5 transition-colors ${
                level === lv
                  ? "border-postup-blue bg-postup-soft"
                  : "border-transparent bg-postup-bg hover:bg-postup-bg-2"
              }`}
            >
              <span className="text-lg">{p.emoji}</span>
              <span className="text-[10px] font-semibold text-postup-muted">
                {lv}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-postup-muted mb-1">
          <span>{t(copy.dashboard.sliderMin, locale)}</span>
          <span>{t(copy.dashboard.sliderMax, locale)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={(e) => setLevel(+e.target.value)}
          className="w-full accent-postup-blue"
        />
      </div>

      <button
        type="button"
        onClick={() => setActionsOpen((o) => !o)}
        className="w-full text-left text-sm text-postup-blue font-medium mb-2"
      >
        {actionsOpen
          ? t(copy.dashboard.functionalHide, locale)
          : t(copy.dashboard.functionalToggle, locale)}
      </button>

      {actionsOpen && (
        <div className="mb-3 space-y-2">
          <h3 className="text-xs font-semibold text-postup-muted uppercase tracking-wide m-0">
            {t(copy.dashboard.functionalTitle, locale)}
          </h3>
          {FUNCTIONAL.map((row) => (
            <div
              key={row.key}
              className="flex items-center gap-2 text-sm py-1.5 border-b border-[var(--postup-border)] last:border-0"
            >
              <span>{row.icon}</span>
              <span className="flex-1">{locale === "es" ? row.es : row.en}</span>
              <div className="flex gap-1">
                {(["yes", "help", "no"] as Chip[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChip(row.key, c)}
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      chips[row.key] === c
                        ? "bg-postup-blue text-white border-postup-blue"
                        : "border-[#c5d4e8] text-postup-muted"
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
        className="w-full rounded-full bg-postup-navy text-white font-semibold py-3 text-sm"
      >
        {t(copy.dashboard.savePain, locale)}
      </button>
    </section>
  );
}
