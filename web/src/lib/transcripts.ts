import { promises as fs } from "node:fs";
import path from "node:path";
import { getPatientChart } from "./patient-chart";
import type { PatientId, PatientTranscript, TranscriptTurn } from "./types";

// Server-only. Real patient chat turns get persisted here so the provider's
// Pain Summary tab can summarize them. No seed data — file is empty until
// the patient actually chats.

// On Vercel the function filesystem is read-only outside /tmp, so we anchor
// in /tmp. Locally this also works fine. Data is ephemeral — fine for the
// demo, where a single session's chat just needs to round-trip to the
// provider's Pain Summary tab.
const DATA_DIR = path.join("/tmp", "postup-plus", "transcripts");

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

export async function readTranscript(
  patientId: PatientId,
): Promise<PatientTranscript> {
  try {
    const raw = await fs.readFile(fileFor(patientId), "utf8");
    const parsed = JSON.parse(raw) as PatientTranscript;
    if (parsed && Array.isArray(parsed.turns)) return parsed;
  } catch {
    // file missing or unreadable → fall through to empty
  }
  return { patientId, turns: [] };
}

export async function appendTurn(
  patientId: PatientId,
  turn: Omit<TranscriptTurn, "id" | "pod" | "timestamp"> & {
    timestamp?: string;
  },
): Promise<PatientTranscript> {
  await ensureDir();
  const current = await readTranscript(patientId);
  const timestamp = turn.timestamp ?? new Date().toISOString();
  const next: TranscriptTurn = {
    id: `${patientId}-${current.turns.length + 1}-${Date.now()}`,
    role: turn.role,
    content: turn.content,
    timestamp,
    pod: podForTimestamp(timestamp, patientId),
  };
  const updated: PatientTranscript = {
    patientId,
    turns: [...current.turns, next],
  };
  await fs.writeFile(fileFor(patientId), JSON.stringify(updated, null, 2), "utf8");
  return updated;
}

export async function clearTranscript(patientId: PatientId): Promise<void> {
  try {
    await fs.unlink(fileFor(patientId));
  } catch {
    // already gone
  }
}
