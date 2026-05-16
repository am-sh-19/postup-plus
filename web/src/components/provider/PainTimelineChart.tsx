"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { copy, t } from "@/lib/copy";
import type { Locale, PatientChart, Signal } from "@/lib/types";

interface PainTimelineChartProps {
  chart: PatientChart;
  signals: Signal[];
  locale: Locale;
}

type Range = "3d" | "7d" | "all";

interface ChartPoint {
  x: number; // fractional POD (pod + hour/24)
  pod: number;
  hour: number;
  level: number;
  iso: string;
  note?: string;
}

function podHour(timestamp: string): number {
  const d = new Date(timestamp);
  return d.getUTCHours() + d.getUTCMinutes() / 60;
}

function clockLabel(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const hh = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, "0");
  const ampm = h < 12 ? "a" : "p";
  return `${hh}:${mm}${ampm}`;
}

export function PainTimelineChart({
  chart,
  signals,
  locale,
}: PainTimelineChartProps) {
  const [range, setRange] = useState<Range>("7d");
  const plateau = useMemo(
    () => signals.find((s) => s.id === "plateau"),
    [signals],
  );

  const points: ChartPoint[] = useMemo(
    () =>
      chart.pain
        .map((p) => ({
          x: p.pod + podHour(p.timestamp) / 24,
          pod: p.pod,
          hour: podHour(p.timestamp),
          level: p.level,
          iso: p.timestamp,
          note: p.note,
        }))
        .sort((a, b) => a.x - b.x),
    [chart.pain],
  );

  const today = chart.meta.todayPod;
  const minPod = range === "3d" ? today - 3 : range === "7d" ? today - 7 : 0;
  const visible = points.filter((p) => p.x >= minPod);

  const doseMarkers = useMemo(
    () =>
      chart.doses
        .filter((d) => d.scheduled)
        .map((d) => ({
          x: d.pod + podHour(d.timestamp) / 24,
          taken: d.taken,
        }))
        .filter((m) => m.x >= minPod),
    [chart.doses, minPod],
  );

  return (
    <section
      className="bg-white rounded-[var(--postup-rounded)] p-5 shadow-sm border border-[var(--postup-border)]/60"
      style={{ boxShadow: "0 1px 3px rgba(2, 31, 83, 0.05), 0 8px 24px rgba(2, 31, 83, 0.03)" }}
      aria-label="Pain over time"
    >
      <header className="flex items-baseline justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-postup-navy m-0">
            {t(copy.provider.painTitle, locale)}
          </h3>
          <p className="text-xs text-postup-muted m-0 mt-0.5">
            {t(copy.provider.painAxisX, locale)} · {t(copy.provider.painAxisY, locale)}
          </p>
        </div>
        <div className="inline-flex rounded-full bg-postup-bg p-1 text-[11px]">
          {(["3d", "7d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-full transition ${
                range === r
                  ? "bg-postup-blue text-white font-semibold"
                  : "text-postup-muted"
              }`}
            >
              {r === "3d"
                ? t(copy.provider.painRange3d, locale)
                : r === "7d"
                  ? t(copy.provider.painRange7d, locale)
                  : t(copy.provider.painRangeAll, locale)}
            </button>
          ))}
        </div>
      </header>

      <div className="h-[260px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visible} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,31,83,0.07)" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[minPod, today + 0.2]}
              ticks={Array.from(
                { length: Math.ceil(today - minPod) + 1 },
                (_, i) => Math.ceil(minPod) + i,
              )}
              tickFormatter={(v) => `POD ${Math.round(v)}`}
              stroke="rgba(2,31,83,0.5)"
              fontSize={11}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              stroke="rgba(2,31,83,0.5)"
              fontSize={11}
              width={30}
            />
            {plateau?.focusPod && (
              <ReferenceArea
                x1={plateau.focusPod.start}
                x2={plateau.focusPod.end + 1}
                y1={5}
                y2={10}
                fill="rgba(239, 68, 68, 0.06)"
                stroke="rgba(239, 68, 68, 0.25)"
                strokeDasharray="4 4"
              />
            )}
            <Tooltip
              cursor={{ stroke: "rgba(42,140,224,0.35)" }}
              contentStyle={{
                background: "white",
                border: "1px solid rgba(2,31,83,0.1)",
                borderRadius: 12,
                fontSize: 12,
                padding: "8px 10px",
              }}
              labelFormatter={(v) => {
                const num = typeof v === "number" ? v : Number(v);
                if (!Number.isFinite(num)) return "";
                const pod = Math.floor(num);
                const hour = (num - pod) * 24;
                return `POD ${pod} · ${clockLabel(hour)}`;
              }}
              formatter={(value, _name, item) => {
                const point = (item as { payload?: ChartPoint } | undefined)?.payload;
                const note = point?.note;
                return [`${value}/10${note ? ` — ${note}` : ""}`, "Pain"];
              }}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="var(--postup-blue)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--postup-blue)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            {doseMarkers.map((m, i) => (
              <ReferenceDot
                key={`d${i}`}
                x={m.x}
                y={0.4}
                r={4}
                fill={m.taken ? "var(--postup-green)" : "rgba(239,68,68,0.85)"}
                stroke="white"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-3 flex flex-wrap gap-3 text-[11px] text-postup-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-postup-green" />
          {t(copy.provider.painLegendDose, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/85" />
          {t(copy.provider.painLegendSkipped, locale)}
        </span>
        {plateau && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500/10 border border-red-500/30" />
            {t(copy.provider.painLegendPlateau, locale)}
          </span>
        )}
      </footer>
    </section>
  );
}
