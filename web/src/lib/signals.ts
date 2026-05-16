import type {
  PatientChart,
  Signal,
  SignalSeverity,
  SignalSource,
} from "./types";

const PLATEAU_THRESHOLD = 5;
const PLATEAU_MIN_DAYS = 3;
const SKIPPED_DOSE_WINDOW = 6;
const SKIPPED_DOSE_TRIGGER = 2;
const NEUROPATHIC_TAGS = new Set(["neuropathic"]);

interface SignalSeed {
  id: string;
  source: SignalSource;
  severity: SignalSeverity;
  title: Record<"en" | "es", string>;
  detail: Record<"en" | "es", string>;
  expected?: Record<"en" | "es", string>;
  focusPod?: { start: number; end: number };
}

function dailyAverages(chart: PatientChart): Map<number, number> {
  const buckets = new Map<number, number[]>();
  for (const entry of chart.pain) {
    const arr = buckets.get(entry.pod) ?? [];
    arr.push(entry.level);
    buckets.set(entry.pod, arr);
  }
  const out = new Map<number, number>();
  for (const [pod, scores] of buckets) {
    const sum = scores.reduce((a, b) => a + b, 0);
    out.set(pod, sum / scores.length);
  }
  return out;
}

function detectPlateau(chart: PatientChart): SignalSeed | null {
  const avgs = [...dailyAverages(chart).entries()].sort((a, b) => a[0] - b[0]);
  if (avgs.length < PLATEAU_MIN_DAYS) return null;

  const tail = avgs.slice(-PLATEAU_MIN_DAYS);
  const allElevated = tail.every(([, avg]) => avg >= PLATEAU_THRESHOLD);
  if (!allElevated) return null;

  const startPod = tail[0]![0];
  const endPod = tail[tail.length - 1]![0];
  const meanTail = tail.reduce((s, [, a]) => s + a, 0) / tail.length;

  return {
    id: "plateau",
    source: "pain-plateau",
    severity: meanTail >= 6.5 ? "critical" : "warn",
    title: {
      en: "Pain plateau",
      es: "Meseta de dolor",
    },
    detail: {
      en: `Avg ${meanTail.toFixed(1)}/10 across POD ${startPod}–${endPod}`,
      es: `Promedio ${meanTail.toFixed(1)}/10 en POD ${startPod}–${endPod}`,
    },
    expected: {
      en: "Expected: declining trend",
      es: "Esperado: tendencia descendente",
    },
    focusPod: { start: startPod, end: endPod },
  };
}

function detectMissedDoses(chart: PatientChart): SignalSeed | null {
  const scheduled = chart.doses
    .filter((d) => d.scheduled)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const window = scheduled.slice(-SKIPPED_DOSE_WINDOW);
  if (window.length === 0) return null;

  const skipped = window.filter((d) => !d.taken).length;
  if (skipped <= SKIPPED_DOSE_TRIGGER) return null;

  const drug = window[0]?.drug ?? "scheduled meds";
  return {
    id: "missed-doses",
    source: "missed-doses",
    severity: "warn",
    title: {
      en: "Med under-dosing",
      es: "Subdosis del medicamento",
    },
    detail: {
      en: `${skipped} of last ${window.length} ${drug} doses skipped`,
      es: `${skipped} de las últimas ${window.length} dosis de ${drug} omitidas`,
    },
  };
}

function detectLowWalks(chart: PatientChart): SignalSeed | null {
  const today = chart.meta.todayPod;
  // Look at last completed POD (today-1) and at today's pace
  const yesterday = today - 1;
  if (yesterday < 1) return null;
  const yesterdayWalks = chart.walks.filter((w) => w.pod === yesterday).length;
  const goal = 8;
  if (yesterdayWalks >= goal / 2) return null;

  return {
    id: "low-walks",
    source: "low-walks",
    severity: yesterdayWalks <= 2 ? "warn" : "info",
    title: {
      en: "Low ambulation",
      es: "Movilidad baja",
    },
    detail: {
      en: `${yesterdayWalks} walks on POD ${yesterday} · goal ${goal}/day`,
      es: `${yesterdayWalks} caminatas en POD ${yesterday} · meta ${goal}/día`,
    },
  };
}

function detectNeuropathicLanguage(chart: PatientChart): SignalSeed | null {
  const flagged = chart.symptoms.filter((s) =>
    (s.tags ?? []).some((t) => NEUROPATHIC_TAGS.has(t)),
  );
  if (flagged.length === 0) return null;

  const latest = flagged[flagged.length - 1]!;
  return {
    id: "neuropathic-language",
    source: "neuropathic-language",
    severity: "info",
    title: {
      en: "Neuropathic-quality symptoms",
      es: "Síntomas de tipo neuropático",
    },
    detail: {
      en: `“${latest.text}” · POD ${latest.pod}`,
      es: `“${latest.text}” · POD ${latest.pod}`,
    },
  };
}

function detectNightPain(chart: PatientChart): SignalSeed | null {
  const nighttime = chart.symptoms.filter((s) =>
    (s.tags ?? []).some((t) => t === "nighttime"),
  );
  if (nighttime.length === 0) return null;
  const latest = nighttime[nighttime.length - 1]!;
  return {
    id: "night-pain",
    source: "night-pain",
    severity: "info",
    title: {
      en: "Sleep-disrupting pain",
      es: "Dolor que interrumpe el sueño",
    },
    detail: {
      en: `“${latest.text}” · POD ${latest.pod}`,
      es: `“${latest.text}” · POD ${latest.pod}`,
    },
  };
}

function detectFunctionRegression(chart: PatientChart): SignalSeed | null {
  const checks = [...chart.functional].sort((a, b) => a.pod - b.pod);
  if (checks.length < 2) return null;
  const lastTwo = checks.slice(-2);
  const worsened = lastTwo[0]!.walk === "yes" && lastTwo[1]!.walk !== "yes";
  if (!worsened) return null;
  return {
    id: "function-regression",
    source: "function-regression",
    severity: "warn",
    title: {
      en: "Functional regression",
      es: "Regresión funcional",
    },
    detail: {
      en: `Walk across room: “${lastTwo[0]!.walk}” → “${lastTwo[1]!.walk}” (POD ${lastTwo[0]!.pod}→${lastTwo[1]!.pod})`,
      es: `Caminar: “${lastTwo[0]!.walk}” → “${lastTwo[1]!.walk}” (POD ${lastTwo[0]!.pod}→${lastTwo[1]!.pod})`,
    },
  };
}

const DETECTORS = [
  detectPlateau,
  detectMissedDoses,
  detectLowWalks,
  detectNeuropathicLanguage,
  detectNightPain,
  detectFunctionRegression,
];

const SEVERITY_ORDER: Record<SignalSeverity, number> = {
  critical: 0,
  warn: 1,
  info: 2,
};

export function detectSignals(chart: PatientChart): Signal[] {
  const seeds = DETECTORS.map((d) => d(chart)).filter(
    (s): s is SignalSeed => s !== null,
  );
  seeds.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
  return seeds;
}
