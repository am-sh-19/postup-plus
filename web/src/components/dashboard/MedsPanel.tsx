"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import type { ChatSystemEvent, Locale, Patient } from "@/lib/types";

interface MedsPanelProps {
  patient: Patient;
  locale: Locale;
  onLogEvent: (event: ChatSystemEvent) => void;
}

export function MedsPanel({ patient, locale, onLogEvent }: MedsPanelProps) {
  const [foodDone, setFoodDone] = useState(false);
  const [doseDone, setDoseDone] = useState(false);

  const med = patient.medication;

  function handleWithFood() {
    setFoodDone(true);
    onLogEvent({ kind: "med-with-food", iso: new Date().toISOString() });
  }

  function handleDose() {
    setDoseDone(true);
    onLogEvent({ kind: "med-dose", iso: new Date().toISOString() });
    setTimeout(() => {
      setFoodDone(false);
      setDoseDone(false);
    }, 4000);
  }

  return (
    <section className="portal-card p-4">
      <h3 className="text-sm font-semibold m-0 mb-2 text-postup-navy">
        {t(copy.dashboard.medsTitle, locale)}
      </h3>
      <div className="border border-[var(--postup-border)] rounded-[var(--postup-radius)] p-3 bg-postup-bg">
        <p className="font-semibold text-postup-navy text-sm m-0">{med.name}</p>
        <p className="text-xs text-postup-muted m-0 mt-0.5">{med.rx}</p>
        <p className="text-[11px] text-postup-muted mt-1.5 m-0">{med.duration}</p>

        <ul className="mt-3 space-y-2 text-xs text-postup-navy list-none m-0 p-0">
          <li className="pl-3 border-l-2 border-postup-green-dark">
            <strong>{t(copy.dashboard.takeWithFood, locale)}</strong> —{" "}
            {t(copy.dashboard.takeWithFoodDesc, locale)}
          </li>
          <li className="pl-3 border-l-2 border-postup-blue">
            <strong>{t(copy.dashboard.every6h, locale)}</strong> —{" "}
            {t(copy.dashboard.every6hDesc, locale)}
          </li>
        </ul>

        <div className="flex flex-col gap-2 mt-3">
          <button
            type="button"
            onClick={handleWithFood}
            disabled={foodDone}
            className={`text-left text-sm px-3 py-2 rounded-[var(--postup-radius)] border font-medium ${
              foodDone
                ? "border-postup-green-dark bg-postup-move-soft"
                : "border-[var(--postup-border)] bg-white hover:border-postup-navy/30"
            }`}
          >
            {foodDone
              ? locale === "es"
                ? "Registrado — con comida"
                : "Logged — taken with food"
              : t(copy.dashboard.btnWithFood, locale)}
          </button>
          <button
            type="button"
            onClick={handleDose}
            disabled={doseDone}
            className={`text-left text-sm px-3 py-2 rounded-[var(--postup-radius)] border font-medium ${
              doseDone
                ? "border-postup-green-dark bg-postup-move-soft"
                : "border-postup-navy bg-postup-navy text-white"
            }`}
          >
            {doseDone
              ? locale === "es"
                ? "Dosis registrada"
                : "Dose logged"
              : t(copy.dashboard.btnDose, locale)}
          </button>
        </div>

        <p className="text-[11px] text-postup-muted mt-2.5 m-0 text-center">
          {t(copy.dashboard.nextDose, locale)}{" "}
          <strong>{doseDone ? "6h" : patient.nextDoseIn}</strong> ·{" "}
          {t(copy.dashboard.rememberFood, locale)}
        </p>
      </div>
    </section>
  );
}
