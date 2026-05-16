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
  if (hrs < 24)
    return locale === "es" ? `hace ${hrs} h` : `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return locale === "es" ? `hace ${days} d` : `${days} d ago`;
}

function syncDotClass(iso: string, now: Date): string {
  const mins = (now.getTime() - new Date(iso).getTime()) / 60000;
  if (mins < 15) return "bg-postup-green-dark";
  if (mins < 60) return "bg-postup-blue";
  return "bg-red-500";
}

function podPillTone(pod: number): string {
  if (pod <= 3) return "bg-postup-soft text-postup-blue-dark";
  if (pod <= 10) return "bg-postup-move-soft text-postup-green-dark";
  return "bg-postup-navy text-white";
}

export function PatientBanner({ meta, locale }: PatientBannerProps) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const initials = `${meta.firstName[0] ?? ""}${meta.lastName[0] ?? ""}`.toUpperCase();
  const totalDays = Math.max(14, meta.expectedRecoveryPodDays);
  const cells = Array.from({ length: totalDays + 1 }, (_, i) => i);

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="Patient banner"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 shrink-0 rounded-2xl bg-postup-soft text-postup-navy font-semibold flex items-center justify-center text-lg"
          aria-hidden
        >
          {initials || "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-xl font-semibold text-postup-navy leading-tight m-0 tracking-[-0.3px]">
              {meta.firstName} {meta.lastName}
            </h2>
            <span className="text-xs text-postup-muted">
              {meta.sex} · {meta.age}
            </span>
            <span
              className={`ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-postup-muted ${
                !now ? "opacity-0" : ""
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${now ? syncDotClass(meta.lastSyncIso, now) : "bg-transparent"}`}
                aria-hidden
              />
              {t(copy.provider.bannerLastSync, locale)}{" "}
              {now ? formatRelative(meta.lastSyncIso, locale, now) : "—"}
            </span>
          </div>
          <p className="m-0 text-xs text-postup-muted mt-0.5">
            {t(copy.provider.bannerMrn, locale)} {meta.mrn}
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-base font-semibold text-postup-navy">
              {meta.procedureLong}
            </span>
            <span
              className={`text-xs font-semibold rounded-full px-3 py-1 ${podPillTone(meta.todayPod)}`}
            >
              {t(copy.provider.bannerPodLong, locale)} {meta.todayPod}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-postup-muted">
            {t(copy.provider.bannerSurgeon, locale)}
          </dt>
          <dd className="text-postup-navy font-medium">{meta.surgeon}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-postup-muted">
            {t(copy.provider.bannerAllergies, locale)}
          </dt>
          <dd className="text-postup-navy font-medium">{meta.allergies}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-postup-muted">
            {t(copy.provider.bannerLang, locale)}
          </dt>
          <dd className="text-postup-navy font-medium">
            {meta.language === "es" ? "Español" : "English"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-postup-muted">
            {t(copy.provider.bannerPhone, locale)}
          </dt>
          <dd className="text-postup-navy font-medium">{meta.phoneMasked}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wider text-postup-muted mb-1.5">
          {t(copy.provider.bannerPodProgress, locale)}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-postup-muted">POD 0</span>
          <div
            className="flex-1 flex items-center gap-[3px]"
            role="img"
            aria-label={`Day ${meta.todayPod} of ${totalDays}`}
          >
            {cells.map((i) => {
              const done = i < meta.todayPod;
              const today = i === meta.todayPod;
              return (
                <div
                  key={i}
                  className={`relative flex-1 h-3 rounded-full ${
                    today
                      ? "bg-postup-blue"
                      : done
                        ? "bg-postup-green"
                        : "bg-postup-bg-2 border border-[var(--postup-border)]"
                  }`}
                >
                  {today && (
                    <span
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-postup-blue-dark whitespace-nowrap"
                      aria-hidden
                    >
                      ↑ {t(copy.provider.bannerToday, locale)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-postup-muted">POD {totalDays}</span>
        </div>
      </div>
    </section>
  );
}
