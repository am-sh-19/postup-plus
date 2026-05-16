"use client";

import { useMemo } from "react";
import { copy, t } from "@/lib/copy";
import type { Locale, PatientChart } from "@/lib/types";

interface MovementHeatmapProps {
  chart: PatientChart;
  locale: Locale;
}

const HOUR_BINS = 12;
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
      const walks = chart.walks.filter((w) => {
        if (w.pod !== pod) return false;
        const d = new Date(w.timestamp);
        const h = d.getUTCHours() + d.getUTCMinutes() / 60;
        return h >= binStart && h < binEnd;
      });
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
  none: "bg-sp-canvas border border-sp-line-soft",
  short: "bg-sp-teal-100 border border-sp-teal-200",
  long: "bg-sp-teal-500 border border-sp-teal-600",
  future:
    "bg-transparent border border-dashed border-sp-line",
};

function walkCount(chart: PatientChart, pod: number): number {
  return chart.walks.filter((w) => w.pod === pod).length;
}

export function MovementHeatmap({ chart, locale }: MovementHeatmapProps) {
  const grid = useMemo(() => buildGrid(chart), [chart]);
  const today = chart.meta.todayPod;
  const todayWalks = walkCount(chart, today);
  const now = new Date(chart.meta.lastSyncIso);
  const hoursLeft = Math.max(
    0,
    22 - (now.getUTCHours() + now.getUTCMinutes() / 60),
  );
  const elapsed = Math.max(1, now.getUTCHours());
  const paceProjection = Math.round(todayWalks + hoursLeft * (todayWalks / elapsed));
  const projColor =
    paceProjection >= WALK_GOAL
      ? "text-sp-success"
      : paceProjection >= 5
        ? "text-sp-warn"
        : "text-sp-danger";

  return (
    <section
      className="bg-white rounded-lg border border-sp-line"
      aria-label="Movement adherence heatmap"
    >
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-sp-line-soft">
        <div>
          <h3 className="text-[15px] font-semibold text-sp-ink m-0 tracking-tight">
            {t(copy.provider.movementTitle, locale)}
          </h3>
          <p className="text-[11px] text-sp-muted m-0 mt-0.5 uppercase tracking-[0.06em]">
            {t(copy.provider.movementSubtitle, locale)}
          </p>
        </div>
      </header>

      <div className="overflow-x-auto px-5 py-4">
        <table className="border-separate border-spacing-[2px] text-xs" role="grid">
          <thead>
            <tr>
              <th
                className="text-left text-[10px] uppercase tracking-[0.06em] text-sp-subtle font-semibold w-14"
                scope="col"
              />
              {HOUR_LABELS.map((label) => (
                <th
                  key={label}
                  className="text-[10px] font-normal text-sp-subtle w-7 text-center"
                  scope="col"
                >
                  {label}
                </th>
              ))}
              <th
                className="text-[10px] uppercase tracking-[0.06em] text-sp-subtle font-semibold pl-3 text-right"
                scope="col"
              >
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
              const wayBelow = dailyWalks < WALK_GOAL / 2 && !isToday;
              return (
                <tr key={pod}>
                  <th
                    scope="row"
                    className={`text-[11px] font-medium pr-3 text-left whitespace-nowrap ${
                      isToday ? "text-sp-teal-800 font-semibold" : "text-sp-muted"
                    }`}
                  >
                    POD {pod}
                    {isToday && (
                      <span className="ml-1 text-[9px] uppercase tracking-[0.08em] text-sp-teal-700">
                        ·{t(copy.provider.bannerToday, locale)}
                      </span>
                    )}
                  </th>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      title={`POD ${cell.pod} · ${HOUR_LABELS[cIdx]} · ${
                        cell.minutes > 0 ? `${cell.minutes} min walk` : "no walk"
                      }`}
                      className={`h-5 w-7 rounded-sm ${CELL_STYLE[cell.state]}`}
                    />
                  ))}
                  <td className="pl-3 text-right text-[12px] font-mono font-semibold text-sp-ink whitespace-nowrap">
                    {dailyWalks}
                    {hitsGoal && <span className="text-sp-success ml-1">✓</span>}
                    {wayBelow && <span className="text-sp-warn ml-1">!</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between gap-4 text-[11px] text-sp-muted px-5 py-3 border-t border-sp-line-soft flex-wrap">
        <div className="flex gap-3">
          <Legend swatch="bg-sp-canvas border border-sp-line" label="none" />
          <Legend swatch="bg-sp-teal-100 border border-sp-teal-200" label="≤5 min" />
          <Legend swatch="bg-sp-teal-500" label=">5 min" />
        </div>
        <p className="m-0">
          <span className="text-sp-ink font-medium">
            {t(copy.provider.movementToday, locale)}:
          </span>{" "}
          {todayWalks} {t(copy.provider.movementWalks, locale)} →{" "}
          <span className={`font-mono font-semibold ${projColor}`}>
            {t(copy.provider.movementProjected, locale)} {paceProjection}/
            {WALK_GOAL}
          </span>
        </p>
      </footer>
    </section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}
