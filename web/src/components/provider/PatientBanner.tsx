"use client";

import { useEffect, useState } from "react";
import { copy, t } from "@/lib/copy";
import type { Locale, PatientChartMeta } from "@/lib/types";

interface PatientBannerProps {
  meta: PatientChartMeta;
  locale: Locale;
}

function formatRelative(iso: string, locale: Locale, now: Date): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 1) return locale === "es" ? "ahora mismo" : "just now";
  if (mins < 60) return locale === "es" ? `hace ${mins} min` : `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return locale === "es" ? `hace ${hrs} h` : `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return locale === "es" ? `hace ${days} d` : `${days} d ago`;
}

function syncDot(iso: string, now: Date): string {
  const mins = (now.getTime() - new Date(iso).getTime()) / 60000;
  if (mins < 15) return "bg-sp-success";
  if (mins < 60) return "bg-sp-teal-500";
  return "bg-sp-danger";
}

export function PatientBanner({ meta, locale }: PatientBannerProps) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const initials =
    `${meta.firstName[0] ?? ""}${meta.lastName[0] ?? ""}`.toUpperCase();

  return (
    <section
      className="bg-white rounded-lg border border-sp-line px-4 py-3 flex items-center gap-4 flex-wrap"
      aria-label="Patient identity"
    >
      <div
        className="w-9 h-9 shrink-0 rounded-full bg-sp-teal-50 text-sp-teal-800 font-semibold flex items-center justify-center text-[12px] tracking-wide ring-1 ring-sp-teal-100"
        aria-hidden
      >
        {initials || "—"}
      </div>

      <div className="flex-1 min-w-[200px]">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h2 className="text-[15.5px] font-semibold text-sp-ink leading-tight m-0 tracking-[-0.01em]">
            {meta.firstName} {meta.lastName}
          </h2>
          <span className="text-[11px] text-sp-muted font-mono">{meta.mrn}</span>
          <span className="text-[11px] text-sp-subtle">·</span>
          <span className="text-[11px] text-sp-muted">
            {meta.sex} · {meta.age}
          </span>
        </div>
        <p className="m-0 mt-0.5 text-[12px] text-sp-text leading-snug">
          {meta.procedureLong}
          <span className="mx-1.5 text-sp-subtle">·</span>
          <span className="text-sp-ink font-medium">
            {t(copy.provider.bannerPodLong, locale)} {meta.todayPod}
          </span>
          <span className="mx-1.5 text-sp-subtle">·</span>
          <span className="text-sp-muted">{meta.surgeon}</span>
        </p>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-sp-muted">
        <Inline
          label={t(copy.provider.bannerAllergies, locale)}
          value={meta.allergies}
        />
        <Inline
          label={t(copy.provider.bannerLang, locale)}
          value={meta.language === "es" ? "ES" : "EN"}
        />
        <span
          className={`inline-flex items-center gap-1.5 ${
            !now ? "opacity-0" : ""
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${now ? syncDot(meta.lastSyncIso, now) : ""}`}
            aria-hidden
          />
          <span className="uppercase tracking-[0.06em]">
            {t(copy.provider.bannerLastSync, locale)}
          </span>{" "}
          {now ? formatRelative(meta.lastSyncIso, locale, now) : "—"}
        </span>
      </div>
    </section>
  );
}

function Inline({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="uppercase tracking-[0.06em] text-sp-subtle">
        {label}
      </span>
      <span className="text-sp-text">{value}</span>
    </span>
  );
}
