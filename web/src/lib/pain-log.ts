import { promises as fs } from "node:fs";
import path from "node:path";
import { getPatientChart } from "./patient-chart";
import type { PainEntry, PatientId } from "./types";

// Server-only. Pain check-ins the patient saves in the portal land here so
// the provider's pain timeline and AI insights can reflect what they're
// actually reporting. The hardcoded chart history in `patient-charts.json`
// stays untouched; these entries are merged on read.

// Same /tmp anchoring as transcripts.ts — Vercel's function FS is read-only
// outside /tmp. Demo state, intentionally ephemeral.
const DATA_DIR = path.join("/tmp", "postup-plus", "pain-log");

function fileFor(patientId: PatientId): string {
  return path.join(DATA_DIR, `${patientId}.json`);
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function podForTimestamp(iso: string, patientId: PatientId): number {
  try {
    const chart = getPatientChart(patientId);
    const surgery = new Date(chart.meta.surgeryDateIso).getTime();
    const t = new Date(iso).getTime();
    return Math.max(0, Math.floor((t - surgery) / (24 * 60 * 60 * 1000)));
  } catch {
    return 0;
  }
}

export async function readPainLog(patientId: PatientId): Promise<PainEntry[]> {
  try {
    const raw = await fs.readFile(fileFor(patientId), "utf8");
    const parsed = JSON.parse(raw) as PainEntry[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // file missing or unreadable → empty log
  }
  return [];
}

export async function appendPainEntry(
  patientId: PatientId,
  entry: { level: number; timestamp?: string; note?: string },
): Promise<PainEntry[]> {
  await ensureDir();
  const current = await readPainLog(patientId);
  const timestamp = entry.timestamp ?? new Date().toISOString();
  const next: PainEntry = {
    timestamp,
    pod: podForTimestamp(timestamp, patientId),
    level: entry.level,
    note: entry.note,
  };
  const updated = [...current, next];
  await fs.writeFile(fileFor(patientId), JSON.stringify(updated, null, 2), "utf8");
  return updated;
}

export async function clearPainLog(patientId: PatientId): Promise<void> {
  try {
    await fs.unlink(fileFor(patientId));
  } catch {
    // already gone
  }
}
