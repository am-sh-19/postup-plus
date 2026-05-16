"use client";

import { LogoHomeLink } from "@/components/brand/LogoHomeLink";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

interface LoginShellProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: React.ReactNode;
}

const PILLARS: Array<Record<Locale, string>> = [
  { en: "Daily check-ins, in your words", es: "Chequeos diarios, en sus palabras" },
  { en: "Medication and movement reminders", es: "Recordatorios de medicamentos y movimiento" },
  { en: "Care team, one message away", es: "Equipo de atención, a un mensaje" },
];

const HEADLINE: Record<Locale, { lead: string; em: string; trail: string }> = {
  en: { lead: "Recovery, ", em: "day by day", trail: "." },
  es: { lead: "Recuperación, ", em: "día a día", trail: "." },
};

const SUB: Record<Locale, string> = {
  en: "Check in on pain, log medications, and chat with your care team — anytime.",
  es: "Registre el dolor, anote los medicamentos y converse con su equipo de atención — en cualquier momento.",
};

const FOOTER: Record<Locale, string> = {
  en: "HIPAA-protected · End-to-end encrypted",
  es: "Protegido por HIPAA · Cifrado de extremo a extremo",
};

export function LoginShell({
  locale,
  onLocaleChange,
  children,
}: LoginShellProps) {
  const head = HEADLINE[locale];

  return (
    <div className="login-surface min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <LogoHomeLink height={36} />
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
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 px-6 pb-10 pt-10 sm:px-10 sm:pt-14 max-w-[1180px] w-full mx-auto items-center">
        <section className="max-lg:text-center lg:pr-4">
          <p className="text-[12px] tracking-[0.18em] uppercase font-semibold text-[oklch(0.45_0.06_240)] mb-5 max-lg:justify-center inline-flex items-center gap-2">
            <span aria-hidden className="h-1 w-6 rounded-full bg-[var(--postup-blue)]/70" />
            PostUp+
          </p>
          <h1 className="login-headline text-[clamp(2.4rem,5.4vw,3.75rem)] mb-5">
            {head.lead}
            <em>{head.em}</em>
            {head.trail}
          </h1>
          <p className="text-[15px] leading-[1.65] text-[oklch(0.4_0.04_245)] max-w-[44ch] mb-8 max-lg:mx-auto">
            {t(SUB, locale)}
          </p>
          <ul className="flex flex-col gap-3 max-lg:items-center">
            {PILLARS.map((p) => (
              <li key={p.en} className="login-pillar">
                <span className="login-pillar__dot" aria-hidden />
                {t(p, locale)}
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0">
          <div className="login-card p-6 sm:p-8">{children}</div>
          <p className="mt-4 text-center text-[12px] text-[oklch(0.5_0.04_245)] flex items-center justify-center gap-1.5">
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              width="12"
              height="12"
              className="text-[oklch(0.5_0.06_240)]"
            >
              <path
                fill="currentColor"
                d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm-2 5V4.5a2 2 0 1 1 4 0V6H6Z"
              />
            </svg>
            {t(FOOTER, locale)}
          </p>
        </section>
      </main>

      <footer className="px-6 pb-6 sm:px-10 text-[11px] text-[oklch(0.55_0.03_245)] flex items-center justify-between max-sm:flex-col max-sm:gap-2">
        <span>© {new Date().getFullYear()} PostUp+</span>
        <span className="opacity-80">
          {locale === "es"
            ? "Cuidado posquirúrgico ortopédico"
            : "Orthopedic post-operative care"}
        </span>
      </footer>
    </div>
  );
}
