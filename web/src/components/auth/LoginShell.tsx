"use client";

import { LogoHomeLink } from "@/components/brand/LogoHomeLink";
import type { Locale } from "@/lib/types";

interface LoginShellProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: React.ReactNode;
}

export function LoginShell({
  locale,
  onLocaleChange,
  children,
}: LoginShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[var(--postup-bg)]">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-6">
          <LogoHomeLink height={44} />
        </div>

        <div className="card p-6 sm:p-7">
          <div className="flex justify-end mb-5">
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
          {children}
        </div>
      </div>
    </div>
  );
}
