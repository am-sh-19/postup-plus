"use client";

import { useState } from "react";
import type { Locale, Patient } from "@/lib/types";

interface DownloadPlanButtonProps {
  patient: Patient;
  locale: Locale;
}

const COPY: Record<
  Locale,
  { idle: string; busy: string; done: string; hint: string }
> = {
  en: {
    idle: "Download my recovery plan",
    busy: "Preparing your PDF…",
    done: "Saved · PDF ready",
    hint: "A personalized plan from your chart",
  },
  es: {
    idle: "Descargar mi plan",
    busy: "Preparando su PDF…",
    done: "Guardado · PDF listo",
    hint: "Un plan personalizado desde su expediente",
  },
};

export function DownloadPlanButton({ patient, locale }: DownloadPlanButtonProps) {
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const c = COPY[locale];

  async function handleDownload() {
    if (status === "busy") return;
    setStatus("busy");
    try {
      const [{ pdf }, { RecoveryPlanPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./RecoveryPlanPDF"),
      ]);

      const blob = await pdf(
        <RecoveryPlanPDF patient={patient} locale={locale} />,
      ).toBlob();

      const filename = `PostUp+ Recovery Plan — ${patient.firstName} ${patient.lastName}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a tick so Safari has time to start the download.
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2400);
    } catch (err) {
      console.error("PDF generation failed", err);
      setStatus("idle");
    }
  }

  const isBusy = status === "busy";
  const isDone = status === "done";

  return (
    <section className="panel p-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isBusy}
        aria-live="polite"
        className={`w-full text-left flex items-center gap-3 rounded-[var(--postup-radius)] px-3 py-3 transition-colors ${
          isDone
            ? "bg-postup-move-soft text-postup-green-dark"
            : "bg-postup-navy text-white hover:brightness-110"
        } disabled:cursor-progress`}
      >
        <span
          className={`shrink-0 grid place-items-center w-9 h-9 rounded-[8px] ${
            isDone ? "bg-white/70" : "bg-white/12"
          }`}
          aria-hidden
        >
          {isBusy ? (
            <span className="block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-[login-spin_0.7s_linear_infinite]" />
          ) : isDone ? (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 10.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-semibold leading-tight">
            {isBusy ? c.busy : isDone ? c.done : c.idle}
          </span>
          <span
            className={`block text-[11px] mt-0.5 leading-tight ${
              isDone ? "text-postup-green-dark/80" : "text-white/70"
            }`}
          >
            {isDone
              ? `${patient.firstName} · ${patient.procedure}`
              : c.hint}
          </span>
        </span>
        {!isBusy && !isDone && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] font-semibold text-white/55">
            PDF
          </span>
        )}
      </button>
    </section>
  );
}
