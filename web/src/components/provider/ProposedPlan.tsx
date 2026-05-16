"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import { removePlanItem } from "@/lib/plan-store";
import type { Locale, PatientId, PlanItem } from "@/lib/types";

interface ProposedPlanProps {
  items: PlanItem[];
  patientId: PatientId;
  locale: Locale;
  onChange: (items: PlanItem[]) => void;
}

export function ProposedPlan({
  items,
  patientId,
  locale,
  onChange,
}: ProposedPlanProps) {
  const [finalized, setFinalized] = useState(false);

  function remove(id: string) {
    const next = removePlanItem(patientId, id);
    onChange(next);
    setFinalized(false);
  }

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="Proposed plan"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-postup-navy m-0">
          📋 {t(copy.provider.planTitle, locale)}
        </h3>
        <p className="text-xs text-postup-muted m-0 mt-0.5">
          {t(copy.provider.planSubtitle, locale)}
        </p>
      </header>

      {items.length === 0 && (
        <p className="text-sm text-postup-muted m-0">
          {t(copy.provider.planEmpty, locale)}
        </p>
      )}

      <ul className="m-0 p-0 list-none space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl bg-postup-move-soft border border-postup-green/30 px-3 py-2.5"
          >
            <span className="text-postup-green-dark font-bold text-sm mt-0.5">＋</span>
            <div className="flex-1 min-w-0">
              <p className="m-0 text-sm font-semibold text-postup-navy">
                {item.drug}
                <span className="font-normal text-postup-muted ml-2">
                  · {item.dose}
                </span>
              </p>
              <p className="m-0 text-[11px] text-postup-muted">
                {item.duration}
                <span className="mx-1.5">·</span>
                {t(copy.provider.planReason, locale)} {item.reason}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={t(copy.provider.planRemove, locale)}
              className="text-postup-muted hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setFinalized(true)}
            className="w-full rounded-full bg-postup-navy text-white text-sm font-semibold py-3 hover:bg-postup-blue-dark transition"
          >
            {t(copy.provider.planFinalize, locale)}
          </button>
          {finalized && (
            <p className="text-xs text-postup-green-dark mt-2 text-center">
              ✓ {t(copy.provider.planFinalized, locale)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
