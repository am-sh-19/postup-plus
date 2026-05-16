"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { copy, t } from "@/lib/copy";
import { PATIENTS } from "@/lib/patients";
import { getPatientSession } from "@/lib/session";
import type { Locale } from "@/lib/types";

export default function LoadingChartPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [stepIndex, setStepIndex] = useState(0);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const session = getPatientSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const patient = PATIENTS[session.patientId];
    setLocale(session.locale);
    setPatientName(patient.firstName);

    const steps = copy.loading.steps[session.locale];
    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => router.replace("/dashboard"), 400);
          return i;
        }
        return i + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [router]);

  const steps = copy.loading.steps[locale];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--postup-bg)]">
      <Image
        src="/postup-logo.png"
        alt="PostUp+"
        width={160}
        height={42}
        className="h-10 w-auto mb-10"
      />
      <div className="w-full max-w-sm text-center">
        <div className="h-1.5 w-full bg-postup-bg-2 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-postup-blue transition-all duration-500 rounded-full"
            style={{
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
        <h1 className="text-xl font-semibold text-postup-navy mb-2">
          {t(copy.loading.title, locale)}
          {patientName ? `, ${patientName}` : ""}
        </h1>
        <p className="text-postup-muted text-sm animate-pulse">
          {steps[stepIndex]}
        </p>
      </div>
    </div>
  );
}
