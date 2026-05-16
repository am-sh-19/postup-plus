"use client";

import { copy, t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

interface MovementLogProps {
  locale: Locale;
  walkCount: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function MovementLog({
  locale,
  walkCount,
  onIncrement,
  onDecrement,
}: MovementLogProps) {
  return (
    <section className="panel p-3">
      <h3 className="text-sm font-semibold m-0 text-postup-navy">
        {t(copy.dashboard.movementTitle, locale)}
      </h3>
      <p className="text-[11px] text-postup-muted m-0 mt-0.5 mb-2">
        {t(copy.dashboard.movementSub, locale)}
      </p>
      <div className="flex items-center justify-between gap-3 bg-postup-bg rounded-[var(--postup-radius)] px-3 py-2 border border-[var(--postup-border)]">
        <span className="text-xs font-medium text-postup-muted">
          {t(copy.dashboard.walks, locale)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrement}
            aria-label="Decrease walks"
            className="w-8 h-8 rounded-[var(--postup-radius)] border border-[#c5d0de] bg-white text-lg leading-none"
          >
            −
          </button>
          <span className="text-lg font-bold min-w-[2ch] text-center tabular-nums">
            {walkCount}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            aria-label="Add a walk"
            className="w-8 h-8 rounded-[var(--postup-radius)] border-0 bg-postup-navy text-white text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-xs text-postup-muted mt-2 m-0">
        <strong className="text-postup-navy tabular-nums">{walkCount * 5}</strong>{" "}
        {t(copy.dashboard.minTotal, locale)}
      </p>
    </section>
  );
}
