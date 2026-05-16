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
      className="bg-white rounded-lg border border-sp-line"
      aria-label="Proposed plan"
    >
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-sp-line-soft">
        <div>
          <h3 className="text-[15px] font-semibold text-sp-ink m-0 tracking-tight">
            {t(copy.provider.planTitle, locale)}
          </h3>
          <p className="text-[12px] text-sp-muted m-0 mt-0.5">
            {t(copy.provider.planSubtitle, locale)}
          </p>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] uppercase tracking-[0.08em] text-sp-teal-700 bg-sp-teal-50 border border-sp-teal-100 rounded px-2 py-0.5 font-semibold">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-sp-muted px-5 py-6 m-0">
          {t(copy.provider.planEmpty, locale)}
        </p>
      ) : (
        <ol className="m-0 p-0 list-none divide-y divide-sp-line-soft">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="group flex items-center gap-4 px-5 py-3 hover:bg-sp-canvas"
            >
              <span className="text-[11px] font-mono text-sp-subtle w-5 text-right">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13.5px] font-medium text-sp-ink">
                  {item.drug}
                </p>
                <p className="m-0 text-[12px] text-sp-muted font-mono">
                  {item.dose}
                  <span className="text-sp-subtle"> · </span>
                  <span className="font-sans">{item.duration}</span>
                  <span className="text-sp-subtle"> · </span>
                  <span className="font-sans">
                    {t(copy.provider.planReason, locale)} {item.reason}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={t(copy.provider.planRemove, locale)}
                className="text-sp-subtle hover:text-sp-danger text-[14px] leading-none px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                {t(copy.provider.planRemove, locale)}
              </button>
            </li>
          ))}
        </ol>
      )}

      {items.length > 0 && (
        <footer className="flex items-center justify-between gap-3 px-5 py-3 border-t border-sp-line-soft">
          {finalized ? (
            <p className="text-[12px] text-sp-success m-0">
              ✓ {t(copy.provider.planFinalized, locale)}
            </p>
          ) : (
            <p className="text-[11px] text-sp-muted m-0">
              Patient will see updates on next sync.
            </p>
          )}
          <button
            type="button"
            onClick={() => setFinalized(true)}
            disabled={finalized}
            className="rounded-md bg-sp-teal-600 text-white text-[13px] font-medium px-4 py-2 hover:bg-sp-teal-700 disabled:bg-sp-success disabled:cursor-default"
          >
            {finalized ? "✓ Sent" : t(copy.provider.planFinalize, locale)}
          </button>
        </footer>
      )}
    </section>
  );
}
