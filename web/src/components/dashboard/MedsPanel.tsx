"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import type { Locale, Patient } from "@/lib/types";

interface MedsPanelProps {
  patient: Patient;
  locale: Locale;
  onLog: (message: string) => void;
}

export function MedsPanel({ patient, locale, onLog }: MedsPanelProps) {
  const [foodDone, setFoodDone] = useState(false);
  const [doseDone, setDoseDone] = useState(false);

  const med = patient.medication;

  function handleWithFood() {
    setFoodDone(true);
    onLog(
      locale === "es"
        ? "Percocet registrado con comida. Recuerde: cada 6 horas, no antes."
        : "Percocet logged with food. Remember: every 6 hours, not sooner.",
    );
  }

  function handleDose() {
    setDoseDone(true);
    onLog(
      locale === "es"
        ? "Dosis de Percocet marcada (5/325 mg). Próxima dosis en ~6 horas — con comida."
        : "Percocet dose marked taken (5/325 mg). Next dose in about 6 hours — take with food.",
    );
    setTimeout(() => {
      setFoodDone(false);
      setDoseDone(false);
    }, 4000);
  }

  return (
    <section className="bg-white rounded-2xl p-3.5 shadow-sm border border-[var(--postup-border)]/50">
      <h3 className="text-sm font-semibold m-0 mb-2">
        💊 {t(copy.dashboard.medsTitle, locale)}
      </h3>
      <div className="rounded-xl border border-[var(--postup-border)] p-3 bg-postup-bg/50">
        <p className="font-semibold text-postup-navy text-sm m-0">{med.name}</p>
        <p className="text-xs text-postup-muted m-0 mt-0.5">{med.rx}</p>
        <span className="inline-block mt-1.5 text-[10px] font-medium text-postup-blue-dark bg-postup-soft px-2 py-0.5 rounded-full">
          {med.duration}
        </span>

        <div className="flex flex-col gap-2 mt-3">
          <div className="flex gap-2 text-xs bg-white rounded-lg p-2 border border-[var(--postup-border)]">
            <span>🍽️</span>
            <span>
              <strong>{t(copy.dashboard.takeWithFood, locale)}</strong> —{" "}
              {t(copy.dashboard.takeWithFoodDesc, locale)}
            </span>
          </div>
          <div className="flex gap-2 text-xs bg-white rounded-lg p-2 border border-[var(--postup-border)]">
            <span>⏰</span>
            <span>
              <strong>{t(copy.dashboard.every6h, locale)}</strong> —{" "}
              {t(copy.dashboard.every6hDesc, locale)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <button
            type="button"
            onClick={handleWithFood}
            disabled={foodDone}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm transition-colors ${
              foodDone
                ? "border-postup-green-dark bg-postup-move-soft"
                : "border-[#c5d4e8] bg-white hover:border-postup-blue"
            }`}
          >
            <span>{foodDone ? "✓" : "🍽️"}</span>
            <span className="flex flex-col">
              <span className="font-semibold">
                {foodDone
                  ? locale === "es"
                    ? "Registrado — con comida"
                    : "Logged — taken with food"
                  : t(copy.dashboard.btnWithFood, locale)}
              </span>
              {!foodDone && (
                <small className="text-[10px] text-postup-muted">
                  {t(copy.dashboard.btnWithFoodSub, locale)}
                </small>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={handleDose}
            disabled={doseDone}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm transition-colors ${
              doseDone
                ? "border-postup-green-dark bg-postup-move-soft"
                : "border-postup-blue bg-postup-soft"
            }`}
          >
            <span>{doseDone ? "✓" : "✓"}</span>
            <span className="flex flex-col">
              <span className="font-semibold">
                {doseDone
                  ? locale === "es"
                    ? "Dosis registrada — próxima en ~6 h"
                    : "Dose logged — next in ~6 hours"
                  : t(copy.dashboard.btnDose, locale)}
              </span>
              {!doseDone && (
                <small className="text-[10px] text-postup-muted">
                  {t(copy.dashboard.btnDoseSub, locale)}
                </small>
              )}
            </span>
          </button>
        </div>

        <p className="text-[11px] text-postup-muted mt-2.5 m-0 text-center">
          {t(copy.dashboard.nextDose, locale)}{" "}
          <strong>{doseDone ? "6 hours" : "2h 15m"}</strong> ·{" "}
          {t(copy.dashboard.rememberFood, locale)}
        </p>
      </div>
    </section>
  );
}
