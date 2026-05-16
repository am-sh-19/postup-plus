"use client";

import Image from "next/image";
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--postup-bg)]">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/postup-logo.png"
            alt="PostUp+"
            width={180}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </div>

        <div
          className="bg-white rounded-[var(--postup-rounded)] p-8 shadow-sm border border-[var(--postup-border)]"
          style={{ boxShadow: "0 8px 24px rgba(2, 31, 83, 0.06)" }}
        >
          <div className="flex justify-end mb-4">
            <div className="flex rounded-full bg-[var(--postup-bg)] p-1 text-xs">
              <button
                type="button"
                onClick={() => onLocaleChange("en")}
                className={`rounded-full px-3 py-1 ${locale === "en" ? "bg-postup-blue text-white font-semibold" : "text-postup-muted"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLocaleChange("es")}
                className={`rounded-full px-3 py-1 ${locale === "es" ? "bg-postup-blue text-white font-semibold" : "text-postup-muted"}`}
              >
                Español
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
