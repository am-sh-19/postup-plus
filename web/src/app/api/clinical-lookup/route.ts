import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { MEDICAL_DOMAINS } from "@/lib/ai-contract";
import {
  ContractStreamWriter,
  sseResponse,
  type StreamLikePart,
} from "@/lib/ai-stream-helpers";
import type { PatientChart, Signal } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ClinicalLookupBody {
  query?: string;
  context?: {
    patientChart?: PatientChart;
    signals?: Signal[];
  };
}

function chartFacts(chart: PatientChart, signals: Signal[]): string {
  const meta = chart.meta;
  const meds = chart.medications
    .map((m) => `${m.drug} ${m.dose} ${m.schedule} (POD ${m.startPod}–${m.endPod ?? "?"})`)
    .join("; ");
  const last7Pain = chart.pain.slice(-12).map((p) => `${p.level}@POD${p.pod}`).join(" ");
  const sig = signals
    .map((s) => `${s.severity.toUpperCase()}: ${s.title.en}`)
    .join("; ");
  return `Patient: ${meta.firstName} ${meta.lastName}, ${meta.age}${meta.sex}, ${meta.procedureLong}, POD ${meta.todayPod}.
Allergies: ${meta.allergies}.
Active meds: ${meds || "none on file"}.
Active signals: ${sig || "none"}.
Recent pain check-ins (level@POD): ${last7Pain || "none"}.`;
}

function buildSystemPrompt(): string {
  return [
    "You are a clinical reference assistant for an orthopedic post-operative care team.",
    "Search authoritative medical sources (PubMed, NIH, CDC, UpToDate, Mayo, AAOS, NEJM, JAMA, BMJ, Lancet, Cochrane) and provide evidence-based answers with inline numbered citations.",
    "",
    "Style:",
    "- Be concise — physicians need quick, actionable answers.",
    "- Use plain prose with optional short bullets. No headings.",
    "- Cite inline with [1], [2], etc. Use the same number for repeat sources.",
    "- Include relevant dosing, contraindications, monitoring when applicable.",
    "- Flag patient-specific risks (allergies, comorbidities) based on the supplied chart context.",
    "- Acknowledge uncertainty; recommend specialist input where appropriate.",
    "- Do NOT include a separate references section — the host UI renders sources from the tool output.",
  ].join("\n");
}

export async function POST(req: Request) {
  const body = (await req.json()) as ClinicalLookupBody;
  const query = body.query?.trim();
  if (!query) {
    return Response.json({ error: "query required" }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not set on the server" },
      { status: 500 },
    );
  }

  const chart = body.context?.patientChart;
  const signals = body.context?.signals ?? [];

  const userPrompt = chart
    ? `Patient context:\n${chartFacts(chart, signals)}\n\nClinical question: ${query}\n\nSearch authoritative medical sources and answer with inline numbered citations.`
    : `Clinical question: ${query}\n\nSearch authoritative medical sources and answer with inline numbered citations.`;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const writer = new ContractStreamWriter(controller);
      try {
        const result = streamText({
          model: anthropic("claude-sonnet-4-6"),
          system: buildSystemPrompt(),
          prompt: userPrompt,
          temperature: 0.3,
          tools: {
            web_search: anthropic.tools.webSearch_20250305({
              maxUses: 3,
              allowedDomains: [...MEDICAL_DOMAINS],
            }),
          },
        });

        for await (const part of result.fullStream) {
          writer.handle(part as StreamLikePart);
        }
        writer.finish();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        writer.send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return sseResponse(stream);
}
