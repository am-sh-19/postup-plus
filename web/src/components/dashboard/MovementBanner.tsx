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
      ? `⏱ ${t(copy.dashboard.nextWalk, locale)} ${minutesUntilWalk} min`
      : `🔔 ${t(copy.dashboard.walkNow, locale)}`;

  return (
    <div className="shrink-0 flex items-start gap-3 p-3.5 rounded-[18px] border border-postup-green-dark/30 bg-gradient-to-br from-postup-move-soft to-white shadow-sm">
      <span className="text-[28px] leading-none animate-walk-pulse" aria-hidden>
        🚶‍♀️
      </span>
      <div className="flex-1 min-w-0">
        <strong className="block text-sm font-bold text-postup-green-dark mb-0.5">
          {t(copy.dashboard.moveTitle, locale)}
        </strong>
        <p className="text-xs text-postup-muted m-0 leading-snug">
          {t(copy.dashboard.moveBody, locale)}
        </p>
        <span
          className={`block mt-1.5 text-xs font-semibold ${minutesUntilWalk <= 0 ? "text-postup-blue-dark" : "text-postup-blue-dark"}`}
        >
          {dueText}
        </span>
      </div>
      <button
        type="button"
        onClick={onLogWalk}
        className="shrink-0 rounded-full bg-postup-green-dark text-white text-xs font-semibold px-3.5 py-2 hover:opacity-90"
      >
        {t(copy.dashboard.logWalk, locale)}
      </button>
    </div>
  );
}
