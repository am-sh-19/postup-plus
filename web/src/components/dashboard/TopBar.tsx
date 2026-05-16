import { LogoHomeLink } from "@/components/brand/LogoHomeLink";
import { copy, t } from "@/lib/copy";
import type { Locale, Patient } from "@/lib/types";

interface TopBarProps {
  patient: Patient;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function TopBar({ patient, locale, onLocaleChange }: TopBarProps) {
  return (
    <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-[var(--postup-border)] bg-white">
      <LogoHomeLink height={38} />
      <div className="flex items-center gap-3">
        <p className="text-sm text-postup-muted hidden sm:block m-0">
          {t(copy.dashboard.dayPostOp, locale)} {patient.dayPostOp}{" "}
          {t(copy.dashboard.postOp, locale)} ·{" "}
          <strong className="text-postup-navy font-medium">
            {patient.firstName} {patient.lastName}
          </strong>
        </p>
        <div className="lang-toggle">
          <button
            type="button"
            onClick={() => onLocaleChange("en")}
            className={locale === "en" ? "active" : ""}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLocaleChange("es")}
            className={locale === "es" ? "active" : ""}
          >
            ES
          </button>
        </div>
      </div>
    </header>
  );
}
