import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { MEDICAL_DOMAINS } from "@/lib/ai-contract";
import {
  ContractStreamWriter,
  sseResponse,
  type StreamLikePart,
} from "@/lib/ai-stream-helpers";
import type { PatientChart, RxRecommendation, Signal } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RxRationaleBody {
  recommendation?: RxRecommendation;
  context?: {
    patientChart?: PatientChart;
    signals?: Signal[];
  };
}

function chartFacts(chart: PatientChart, signals: Signal[]): string {
  const meta = chart.meta;
  const meds = chart.medications
    .map((m) => `${m.drug} ${m.dose} ${m.schedule}`)
    .join("; ");
  const sig = signals
    .map((s) => `${s.severity.toUpperCase()}: ${s.title.en} — ${s.detail.en}`)
    .join("; ");
  return [
    `Patient: ${meta.firstName} ${meta.lastName}, ${meta.age}${meta.sex}, ${meta.procedureLong}, POD ${meta.todayPod}.`,
    `Allergies: ${meta.allergies}.`,
    `Active meds: ${meds || "none on file"}.`,
    `Active chart signals: ${sig || "none"}.`,
  ].join("\n");
}

function buildSystemPrompt(): string {
  return [
    "You are a clinical evidence reviewer helping an orthopedic provider weigh a candidate medication change for a post-op patient.",
    "Search authoritative medical sources (PubMed, NIH, CDC, UpToDate, Mayo, AAOS, NEJM, JAMA, BMJ, Lancet, Cochrane).",
    "",
    "Style:",
    "- Be concise. 4–8 short sentences max.",
    "- Lead with whether the proposed change is supported, partially supported, or weak in this patient context.",
    "- Cover: mechanism rationale tied to the chart signals, expected effect size at this stage of recovery, key contraindications/risks, monitoring needed.",
    "- Cite inline with [1], [2]. Use the same number for repeat sources.",
    "- Plain prose with optional bullets. Do NOT add a separate references section — the host UI renders the sources.",
  ].join("\n");
}

export async function POST(req: Request) {
  const body = (await req.json()) as RxRationaleBody;
  const rec = body.recommendation;
  if (!rec || !rec.drug || !rec.dose) {
    return Response.json(
      { error: "recommendation.drug and .dose required" },
      { status: 400 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not set on the server" },
      { status: 500 },
    );
  }

  const chart = body.context?.patientChart;
  const signals = body.context?.signals ?? [];

  const userPrompt = [
    chart ? `Chart context:\n${chartFacts(chart, signals)}\n` : "",
    `Proposed change:`,
    `- Drug: ${rec.drug}`,
    `- Dose / schedule: ${rec.dose}`,
    `- Duration: ${rec.duration}`,
    `- Kind: ${rec.kind}`,
    `- Internal rationale: ${rec.rationale.en}`,
    rec.evidenceQuery ? `- Seed evidence query: ${rec.evidenceQuery}` : "",
    "",
    "Evaluate the evidence for this change in *this* patient. Search the medical literature, cite inline, and end with one short line summarizing your bottom line.",
  ]
    .filter(Boolean)
    .join("\n");

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
              maxUses: 2,
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
