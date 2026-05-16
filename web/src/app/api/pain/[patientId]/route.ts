import { appendPainEntry, readPainLog } from "@/lib/pain-log";
import type { PatientId } from "@/lib/types";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ patientId: string }> };

const VALID_IDS = new Set<PatientId>(["emily", "gabriela"]);

function asPatientId(raw: string): PatientId | null {
  return VALID_IDS.has(raw as PatientId) ? (raw as PatientId) : null;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { patientId: raw } = await ctx.params;
  const patientId = asPatientId(raw);
  if (!patientId) {
    return Response.json({ error: "Unknown patient" }, { status: 404 });
  }
  const entries = await readPainLog(patientId);
  return Response.json({ patientId, entries });
}

export async function POST(req: Request, ctx: RouteContext) {
  const { patientId: raw } = await ctx.params;
  const patientId = asPatientId(raw);
  if (!patientId) {
    return Response.json({ error: "Unknown patient" }, { status: 404 });
  }
  const body = (await req.json()) as {
    level?: number;
    timestamp?: string;
    note?: string;
  };
  if (
    typeof body.level !== "number" ||
    !Number.isFinite(body.level) ||
    body.level < 1 ||
    body.level > 10
  ) {
    return Response.json({ error: "level must be a number 1-10" }, { status: 400 });
  }
  const entries = await appendPainEntry(patientId, {
    level: body.level,
    timestamp: body.timestamp,
    note: body.note,
  });
  return Response.json({ patientId, entries });
}
