"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginShell } from "@/components/auth/LoginShell";
import { copy, t } from "@/lib/copy";
import { setProviderSession } from "@/lib/session";
import type { Locale } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");

  return (
    <LoginShell locale={locale} onLocaleChange={setLocale}>
      <h1 className="text-2xl font-semibold text-postup-navy mb-1">
        {t(copy.roleGate.title, locale)}
      </h1>
      <p className="text-postup-muted text-sm mb-6">
        {t(copy.roleGate.subtitle, locale)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push("/login/patient")}
          className="flex flex-col items-start text-left rounded-2xl border-2 border-postup-blue bg-postup-soft p-4 hover:border-postup-blue-dark transition-colors"
        >
          <span className="text-2xl mb-2" aria-hidden>
            🏠
          </span>
          <span className="font-semibold text-postup-navy">
            {t(copy.roleGate.patient, locale)}
          </span>
          <span className="text-xs text-postup-muted mt-1 leading-snug">
            {t(copy.roleGate.patientDesc, locale)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProviderSession(locale);
            router.push("/provider");
          }}
          className="flex flex-col items-start text-left rounded-2xl border-2 border-[var(--postup-border)] bg-white p-4 hover:border-postup-navy/30 transition-colors"
        >
          <span className="text-2xl mb-2" aria-hidden>
            🩺
          </span>
          <span className="font-semibold text-postup-navy">
            {t(copy.roleGate.provider, locale)}
          </span>
          <span className="text-xs text-postup-muted mt-1 leading-snug">
            {t(copy.roleGate.providerDesc, locale)}
          </span>
        </button>
      </div>
    </LoginShell>
  );
}
