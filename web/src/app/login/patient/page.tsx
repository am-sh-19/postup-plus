"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginShell } from "@/components/auth/LoginShell";
import { copy, t } from "@/lib/copy";
import { PATIENTS } from "@/lib/patients";
import { setPatientSession } from "@/lib/session";
import type { Locale, PatientId } from "@/lib/types";

export default function PatientPickPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [selected, setSelected] = useState<PatientId>("emily");

  function continueAsPatient() {
    setPatientSession(selected, locale);
    router.push("/loading-chart");
  }

  return (
    <LoginShell locale={locale} onLocaleChange={setLocale}>
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="text-sm text-postup-blue mb-4 hover:underline"
      >
        ← {locale === "es" ? "Volver" : "Back"}
      </button>

      <h1 className="text-2xl font-semibold text-postup-navy mb-1">
        {t(copy.patientPick.title, locale)}
      </h1>
      <p className="text-postup-muted text-sm mb-6">
        {t(copy.patientPick.subtitle, locale)}
      </p>

      <div className="space-y-2 mb-6">
        {(Object.keys(PATIENTS) as PatientId[]).map((id) => {
          const p = PATIENTS[id];
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                active
                  ? "border-postup-blue bg-postup-soft"
                  : "border-[var(--postup-border)] bg-white hover:border-postup-blue/40"
              }`}
            >
              <span className="font-semibold text-postup-navy block">
                {p.firstName} {p.lastName}
              </span>
              <span className="text-xs text-postup-muted">
                {t(copy.patientPick.dayPostOp, locale)} {p.dayPostOp}{" "}
                {t(copy.patientPick.postOp, locale)} · {p.procedure}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={continueAsPatient}
        className="w-full rounded-full bg-postup-blue text-white font-semibold py-3.5 hover:bg-postup-blue-dark transition-colors"
      >
        {t(copy.patientPick.continue, locale)}
      </button>
    </LoginShell>
  );
}
