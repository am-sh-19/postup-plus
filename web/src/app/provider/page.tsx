"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PatientChart, ProviderShell } from "@/components/provider";
import { getProviderSession } from "@/lib/session";
import type { Locale } from "@/lib/types";

export default function ProviderPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getProviderSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setLocale(session.locale);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--postup-bg)]">
        <p className="text-postup-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <ProviderShell locale={locale} activeNav="patients">
      <PatientChart locale={locale} />
    </ProviderShell>
  );
}
