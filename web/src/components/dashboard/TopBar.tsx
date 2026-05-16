import Image from "next/image";
import { copy, t } from "@/lib/copy";
import type { Locale, Patient } from "@/lib/types";

interface TopBarProps {
  patient: Patient;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function TopBar({ patient, locale, onLocaleChange }: TopBarProps) {
  return (
    <header className="shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-[var(--postup-border)] bg-[var(--postup-bg)]">
      <Image
        src="/postup-logo.png"
        alt="PostUp+"
        width={140}
        height={42}
        className="h-[42px] w-auto"
        priority
      />
      <div className="flex items-center gap-4">
        <p className="text-sm text-postup-muted hidden sm:block">
          {t(copy.dashboard.dayPostOp, locale)} {patient.dayPostOp}{" "}
          {t(copy.dashboard.postOp, locale)} ·{" "}
          <strong className="text-postup-navy font-semibold">
            <span className="text-postup-green-dark">{patient.firstName}</span>{" "}
            {patient.lastName}
          </strong>
        </p>
        <div className="flex rounded-full bg-white p-1 text-xs shadow-sm">
          <button
            type="button"
            onClick={() => onLocaleChange("en")}
            className={`rounded-full px-2.5 py-1 ${locale === "en" ? "bg-postup-blue text-white font-semibold" : "text-postup-muted"}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLocaleChange("es")}
            className={`rounded-full px-2.5 py-1 ${locale === "es" ? "bg-postup-blue text-white font-semibold" : "text-postup-muted"}`}
          >
            Español
          </button>
        </div>
      </div>
    </header>
  );
}
