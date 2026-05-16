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
  x: number;
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
      className="bg-white rounded-lg border border-sp-line"
      aria-label="Pain over time"
    >
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-sp-line-soft">
        <div>
          <h3 className="text-[15px] font-semibold text-sp-ink m-0 tracking-tight">
            {t(copy.provider.painTitle, locale)}
          </h3>
          <p className="text-[11px] text-sp-muted m-0 mt-0.5 uppercase tracking-[0.06em]">
            {t(copy.provider.painAxisX, locale)} · {t(copy.provider.painAxisY, locale)}
          </p>
        </div>
        <div className="inline-flex rounded-md border border-sp-line p-0.5 text-[11px] bg-white">
          {(["3d", "7d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded transition ${
                range === r
                  ? "bg-sp-teal-50 text-sp-teal-800 font-semibold"
                  : "text-sp-muted hover:text-sp-text"
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

      <div className="h-[260px] px-3 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visible} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--sp-line-soft)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[minPod, today + 0.2]}
              ticks={Array.from(
                { length: Math.ceil(today - minPod) + 1 },
                (_, i) => Math.ceil(minPod) + i,
              )}
              tickFormatter={(v) => `POD ${Math.round(v)}`}
              stroke="var(--sp-subtle)"
              tick={{ fill: "var(--sp-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--sp-line)" }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              stroke="var(--sp-subtle)"
              tick={{ fill: "var(--sp-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            {plateau?.focusPod && (
              <ReferenceArea
                x1={plateau.focusPod.start}
                x2={plateau.focusPod.end + 1}
                y1={5}
                y2={10}
                fill="var(--sp-teal-50)"
                stroke="var(--sp-teal-200)"
                strokeDasharray="3 3"
              />
            )}
            <Tooltip
              cursor={{ stroke: "var(--sp-teal-300)" }}
              contentStyle={{
                background: "white",
                border: "1px solid var(--sp-line)",
                borderRadius: 8,
                fontSize: 12,
                padding: "8px 10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
              stroke="var(--sp-teal-600)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--sp-teal-600)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--sp-teal-700)" }}
              isAnimationActive={false}
            />
            {doseMarkers.map((m, i) => (
              <ReferenceDot
                key={`d${i}`}
                x={m.x}
                y={0.4}
                r={3}
                fill={m.taken ? "var(--sp-success)" : "var(--sp-danger)"}
                stroke="white"
                strokeWidth={1}
                ifOverflow="extendDomain"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer className="flex flex-wrap gap-4 text-[11px] text-sp-muted px-5 py-3 border-t border-sp-line-soft">
        <Legend dot="bg-sp-success" label={t(copy.provider.painLegendDose, locale)} />
        <Legend dot="bg-sp-danger" label={t(copy.provider.painLegendSkipped, locale)} />
        {plateau && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sp-teal-50 border border-sp-teal-200" />
            {t(copy.provider.painLegendPlateau, locale)}
          </span>
        )}
      </footer>
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
