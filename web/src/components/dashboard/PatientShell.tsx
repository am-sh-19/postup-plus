"use client";

import { LogoHomeLink } from "@/components/brand/LogoHomeLink";
import { copy, t } from "@/lib/copy";
import { clearSession } from "@/lib/session";
import type { Locale, Patient } from "@/lib/types";

interface PatientShellProps {
  patient: Patient;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: React.ReactNode;
}

export function PatientShell({
  patient,
  locale,
  onLocaleChange,
  children,
}: PatientShellProps) {
  function signOut() {
    clearSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--postup-bg)]">
      <header className="shrink-0 sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-[var(--postup-border)] bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <LogoHomeLink height={34} />
          <span className="portal-badge shrink-0">
            {locale === "es" ? "Paciente" : "Patient"}
          </span>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <p className="text-sm text-postup-muted hidden md:block m-0 truncate max-w-[280px]">
            {t(copy.dashboard.dayPostOp, locale)} {patient.dayPostOp}{" "}
            {t(copy.dashboard.postOp, locale)} ·{" "}
            <strong className="text-postup-navy font-medium">
              {patient.firstName} {patient.lastName}
            </strong>
          </p>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              className={locale === "en" ? "active" : ""}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("es")}
              className={locale === "es" ? "active" : ""}
              aria-pressed={locale === "es"}
            >
              ES
            </button>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 text-sm font-medium text-postup-navy border border-[var(--postup-border)] px-3 py-1.5 rounded-[var(--postup-radius)] hover:bg-postup-bg bg-white"
          >
            {locale === "es" ? "Salir" : "Sign out"}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 pb-6">
        <div className="max-w-6xl mx-auto flex flex-col">{children}</div>
      </main>
    </div>
  );
}
