"use client";

import { copy, t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

interface MovementBannerProps {
  locale: Locale;
  minutesUntilWalk: number;
  onLogWalk: () => void;
}

export function MovementBanner({
  locale,
  minutesUntilWalk,
  onLogWalk,
}: MovementBannerProps) {
  const dueText =
    minutesUntilWalk > 0
      ? `${t(copy.dashboard.nextWalk, locale)} ${minutesUntilWalk} min`
      : t(copy.dashboard.walkNow, locale);

  return (
    <div className="portal-card shrink-0 flex items-start gap-3 p-4 border-postup-green-dark/25 bg-postup-move-soft">
      <div className="flex-1 min-w-0">
        <strong className="block text-sm font-semibold text-postup-green-dark mb-0.5">
          {t(copy.dashboard.moveTitle, locale)}
        </strong>
        <p className="text-xs text-postup-muted m-0 leading-snug">
          {t(copy.dashboard.moveBody, locale)}
        </p>
        <span className="block mt-1.5 text-xs font-medium text-postup-navy">
          {dueText}
        </span>
      </div>
      <button
        type="button"
        onClick={onLogWalk}
        className="shrink-0 text-xs font-semibold px-3 py-2 rounded-[var(--postup-radius)] bg-postup-green-dark text-white hover:opacity-90"
      >
        {t(copy.dashboard.logWalk, locale)}
      </button>
    </div>
  );
}
