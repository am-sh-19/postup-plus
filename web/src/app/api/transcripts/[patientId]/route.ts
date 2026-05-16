import { appendTurn, readTranscript } from "@/lib/transcripts";
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
  const transcript = await readTranscript(patientId);
  return Response.json(transcript);
}

export async function POST(req: Request, ctx: RouteContext) {
  const { patientId: raw } = await ctx.params;
  const patientId = asPatientId(raw);
  if (!patientId) {
    return Response.json({ error: "Unknown patient" }, { status: 404 });
  }
  const body = (await req.json()) as {
    role?: "user" | "assistant";
    content?: string;
    timestamp?: string;
  };
  if (!body.role || (body.role !== "user" && body.role !== "assistant")) {
    return Response.json({ error: "role must be user|assistant" }, { status: 400 });
  }
  if (!body.content || typeof body.content !== "string") {
    return Response.json({ error: "content required" }, { status: 400 });
  }
  const transcript = await appendTurn(patientId, {
    role: body.role,
    content: body.content,
    timestamp: body.timestamp,
  });
  return Response.json(transcript);
}
