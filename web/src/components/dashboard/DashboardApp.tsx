"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  painCheckInMessage,
  walkLoggedMessage,
} from "@/lib/action-log";
import { getPatient, getPatientsRecord } from "@/lib/data";
import { getPatientSession, setPatientSession } from "@/lib/session";
import type { ChatMessage, Locale } from "@/lib/types";
import { ChatPane } from "./ChatPane";
import { DownloadPlanButton } from "./DownloadPlanButton";
import { FaqSection } from "./FaqSection";
import { MedsPanel } from "./MedsPanel";
import { MovementBanner } from "./MovementBanner";
import { MovementLog } from "./MovementLog";
import { PainPanel } from "./PainPanel";
import { PatientShell } from "./PatientShell";

export function DashboardApp() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [patientId, setPatientId] = useState<
    keyof ReturnType<typeof getPatientsRecord> | null
  >(null);
  const [walkCount, setWalkCount] = useState(2);
  const [minutesUntilWalk, setMinutesUntilWalk] = useState(12);
  const [systemMessages, setSystemMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const session = getPatientSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setPatientId(session.patientId);
    setLocale(session.locale);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setMinutesUntilWalk((m) => (m > 0 ? m - 1 : 0));
    }, 60000);
    return () => clearInterval(timer);
  }, [ready]);

  const patient = patientId ? getPatient(patientId) : null;

  const addSystemMessage = useCallback((content: string) => {
    const at = new Date();
    setSystemMessages((msgs) => [
      ...msgs,
      {
        id: crypto.randomUUID(),
        role: "system",
        content,
        timestamp: at.toISOString(),
      },
    ]);
  }, []);

  function handleLocaleChange(next: Locale) {
    setLocale(next);
    const session = getPatientSession();
    if (session)
      setPatientSession(session.patientId, next, session.username);
  }

  function logWalk() {
    const nextCount = Math.min(walkCount + 1, 24);
    setWalkCount(nextCount);
    setMinutesUntilWalk(60);
    addSystemMessage(walkLoggedMessage(nextCount, locale));
  }

  if (!ready || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--postup-bg)]">
        <p className="text-postup-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <PatientShell
      patient={patient}
      locale={locale}
      onLocaleChange={handleLocaleChange}
    >
      <div className="mb-3 shrink-0 md:hidden">
        <p className="text-sm text-postup-muted m-0">
          Day {patient.dayPostOp} post-op ·{" "}
          <strong className="text-postup-navy font-medium">
            {patient.firstName} {patient.lastName}
          </strong>
        </p>
        <p className="text-xs text-postup-muted m-0 mt-0.5">{patient.procedure}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-1 gap-4 flex-1 min-h-0 lg:h-full lg:min-h-0">
        <ChatPane
          key={`${patient.id}-${locale}`}
          patient={patient}
          locale={locale}
          externalMessages={systemMessages}
          className="lg:col-span-3 min-h-[min(420px,55vh)] lg:min-h-0 lg:h-full lg:max-h-full"
        />

        <aside className="lg:col-span-2 flex flex-col gap-3 min-h-0 lg:h-full lg:max-h-full lg:scroll-region pb-1">
          <MovementBanner
            locale={locale}
            minutesUntilWalk={minutesUntilWalk}
            onLogWalk={logWalk}
          />
          <PainPanel
            locale={locale}
            onSave={(level, label) => {
              addSystemMessage(painCheckInMessage(level, label, locale));
            }}
          />
          <MovementLog
            locale={locale}
            walkCount={walkCount}
            onIncrement={logWalk}
            onDecrement={() => setWalkCount((c) => Math.max(0, c - 1))}
          />
          <MedsPanel
            patient={patient}
            locale={locale}
            onLog={addSystemMessage}
          />
          <DownloadPlanButton patient={patient} locale={locale} />
          <FaqSection locale={locale} />
        </aside>
      </div>
    </PatientShell>
  );
}
