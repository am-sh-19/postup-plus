"use client";

import { useMemo } from "react";
import { copy, t } from "@/lib/copy";
import type { Locale, PatientChart } from "@/lib/types";

interface MovementHeatmapProps {
  chart: PatientChart;
  locale: Locale;
}

const HOUR_BINS = 12; // 2-hour bins covering 0–24
const HOUR_LABELS = [
  "12a",
  "2a",
  "4a",
  "6a",
  "8a",
  "10a",
  "12p",
  "2p",
  "4p",
  "6p",
  "8p",
  "10p",
];
const WALK_GOAL = 8;

interface CellState {
  state: "none" | "short" | "long" | "future";
  minutes: number;
  pod: number;
  binStart: number;
}

function buildGrid(chart: PatientChart): CellState[][] {
  const todayPod = chart.meta.todayPod;
  const rows: CellState[][] = [];
  const now = new Date(chart.meta.lastSyncIso);
  const nowHour = now.getUTCHours() + now.getUTCMinutes() / 60;

  for (let podOffset = 6; podOffset >= 0; podOffset--) {
    const pod = todayPod - podOffset;
    const row: CellState[] = [];
    for (let bin = 0; bin < HOUR_BINS; bin++) {
      const binStart = bin * 2;
      const binEnd = binStart + 2;
      const isFuture = pod === todayPod && binStart > nowHour;
      const walks = chart.walks.filter(
        (w) =>
          w.pod === pod &&
          (() => {
            const d = new Date(w.timestamp);
            const h = d.getUTCHours() + d.getUTCMinutes() / 60;
            return h >= binStart && h < binEnd;
          })(),
      );
      const minutes = walks.reduce((s, w) => s + w.minutes, 0);
      let state: CellState["state"] = "none";
      if (isFuture) state = "future";
      else if (minutes > 5) state = "long";
      else if (minutes > 0) state = "short";
      row.push({ state, minutes, pod, binStart });
    }
    rows.push(row);
  }
  return rows;
}

const CELL_STYLE: Record<CellState["state"], string> = {
  none: "bg-postup-bg border border-[var(--postup-border)]",
  short: "bg-postup-blue/40 border border-postup-blue/40",
  long: "bg-postup-green border border-postup-green-dark/50",
  future: "bg-transparent border border-dashed border-[var(--postup-border)]",
};

function walkCount(chart: PatientChart, pod: number): number {
  return chart.walks.filter((w) => w.pod === pod).length;
}

export function MovementHeatmap({ chart, locale }: MovementHeatmapProps) {
  const grid = useMemo(() => buildGrid(chart), [chart]);
  const today = chart.meta.todayPod;
  const todayWalks = walkCount(chart, today);
  const now = new Date(chart.meta.lastSyncIso);
  const hoursLeft = Math.max(0, 22 - (now.getUTCHours() + now.getUTCMinutes() / 60));
  const paceProjection = Math.round(todayWalks + hoursLeft * (todayWalks / Math.max(1, now.getUTCHours())));
  const projColor =
    paceProjection >= WALK_GOAL
      ? "text-postup-green-dark"
      : paceProjection >= 5
        ? "text-orange-500"
        : "text-red-500";

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="Movement adherence heatmap"
    >
      <header className="flex items-baseline justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-postup-navy m-0">
            🚶 {t(copy.provider.movementTitle, locale)}
          </h3>
          <p className="text-xs text-postup-muted m-0 mt-0.5">
            {t(copy.provider.movementSubtitle, locale)}
          </p>
        </div>
      </header>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="border-separate border-spacing-[3px] text-xs" role="grid">
          <thead>
            <tr>
              <th className="text-left text-[10px] uppercase tracking-wider text-postup-muted font-semibold w-14"></th>
              {HOUR_LABELS.map((label) => (
                <th
                  key={label}
                  className="text-[10px] font-normal text-postup-muted w-7 text-center"
                  scope="col"
                >
                  {label}
                </th>
              ))}
              <th className="text-[10px] uppercase tracking-wider text-postup-muted font-semibold pl-2 text-right">
                {t(copy.provider.movementWalks, locale)}
              </th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rIdx) => {
              const pod = today - (6 - rIdx);
              const dailyWalks = walkCount(chart, pod);
              const isToday = pod === today;
              const hitsGoal = dailyWalks >= WALK_GOAL;
              const wayBelow = dailyWalks < WALK_GOAL / 2;
              return (
                <tr key={pod} className={isToday ? "bg-postup-soft/40 rounded-lg" : ""}>
                  <th
                    scope="row"
                    className={`text-[11px] font-semibold pr-2 text-left ${
                      isToday ? "text-postup-blue-dark" : "text-postup-muted"
                    }`}
                  >
                    POD {pod}
                  </th>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      title={`POD ${cell.pod} · ${HOUR_LABELS[cIdx]} · ${
                        cell.minutes > 0 ? `${cell.minutes} min walk` : "no walk"
                      }`}
                      className={`h-6 w-7 rounded-md ${CELL_STYLE[cell.state]}`}
                    />
                  ))}
                  <td className="pl-2 text-right text-[12px] font-semibold text-postup-navy whitespace-nowrap">
                    {dailyWalks}
                    {hitsGoal && <span className="text-postup-green-dark ml-1">✓</span>}
                    {wayBelow && !isToday && <span className="text-orange-500 ml-1">⚠</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 flex items-center justify-between gap-4 text-[11px] text-postup-muted flex-wrap">
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-postup-bg border border-[var(--postup-border)]" />
            none
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-postup-blue/40" />
            ≤5 min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-postup-green" />
            &gt;5 min
          </span>
        </div>
        <p className="m-0 text-xs">
          <span className="text-postup-navy font-semibold">
            {t(copy.provider.movementToday, locale)}:
          </span>{" "}
          {todayWalks} {t(copy.provider.movementWalks, locale)} →{" "}
          <span className={`font-semibold ${projColor}`}>
            {t(copy.provider.movementProjected, locale)} {paceProjection}/{WALK_GOAL}
          </span>
        </p>
      </footer>
    </section>
  );
}
