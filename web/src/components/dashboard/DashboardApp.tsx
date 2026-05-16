"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { copy, t } from "@/lib/copy";
import { getPatient, getPatientsRecord } from "@/lib/data";
import { getPatientSession, setPatientSession } from "@/lib/session";
import type { ChatMessage, Locale } from "@/lib/types";
import { ChatPane } from "./ChatPane";
import { FaqSection } from "./FaqSection";
import { MedsPanel } from "./MedsPanel";
import { MovementBanner } from "./MovementBanner";
import { MovementLog } from "./MovementLog";
import { PainPanel } from "./PainPanel";
import { TopBar } from "./TopBar";

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

  const addSystemMessage = useCallback(
    (content: string) => {
      setSystemMessages((msgs) => [
        ...msgs,
        { id: crypto.randomUUID(), role: "system", content },
      ]);
    },
    [],
  );

  function handleLocaleChange(next: Locale) {
    setLocale(next);
    const session = getPatientSession();
    if (session)
      setPatientSession(session.patientId, next, session.username);
  }

  function logWalk() {
    setWalkCount((c) => Math.min(c + 1, 24));
    setMinutesUntilWalk(60);
    addSystemMessage(
      locale === "es"
        ? `Caminata de 5 min registrada. ${walkCount + 1} caminatas hoy — siga moviéndose cada hora.`
        : `5-minute walk logged. ${walkCount + 1} walks today — keep moving every hour.`,
    );
  }

  if (!ready || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--postup-bg)]">
        <p className="text-postup-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-dvh flex flex-col bg-[var(--postup-bg)]">
      <TopBar
        patient={patient}
        locale={locale}
        onLocaleChange={handleLocaleChange}
      />

      <div className="flex-1 flex min-h-0 px-4 pb-4 gap-4 max-lg:flex-col">
        <ChatPane
          patient={patient}
          locale={locale}
          externalMessages={systemMessages}
        />

        <aside className="flex-[0_0_40%] max-w-[40%] min-w-[280px] flex flex-col gap-2.5 overflow-y-auto max-lg:flex-none max-lg:max-w-full max-lg:max-h-[50vh]">
          <MovementBanner
            locale={locale}
            minutesUntilWalk={minutesUntilWalk}
            onLogWalk={logWalk}
          />
          <PainPanel
            locale={locale}
            onSave={(level, label) => {
              addSystemMessage(
                locale === "es"
                  ? `Dolor registrado: ${level}/10 (${label}). Su equipo de cuidado puede ver esto.`
                  : `Pain check-in saved: ${level}/10 (${label}). Your care team can see this.`,
              );
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
          <FaqSection locale={locale} />
        </aside>
      </div>
    </div>
  );
}
