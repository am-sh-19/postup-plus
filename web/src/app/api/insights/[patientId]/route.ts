import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { getPatientChart } from "@/lib/patient-chart";
import { readTranscript } from "@/lib/transcripts";
import type { PatientId, PatientInsights } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ patientId: string }> };

const VALID_IDS = new Set<PatientId>(["emily", "gabriela"]);

function asPatientId(raw: string): PatientId | null {
  return VALID_IDS.has(raw as PatientId) ? (raw as PatientId) : null;
}

const SentimentSchema = z.enum([
  "very-negative",
  "negative",
  "neutral",
  "positive",
  "very-positive",
]);

const InsightsSchema = z.object({
  narrative: z
    .string()
    .describe(
      "2–4 sentences. Plain-language summary of how this patient is doing right now from the chat. Cite specifics (e.g., night-time sleep, walker use).",
    ),
  painNarrative: z
    .object({
      pattern: z.string().describe("1–2 sentences on the pain pattern they describe (timing, location, quality)."),
      triggers: z.array(z.string()).max(5).describe("Things they say make it worse (e.g., 'standing more than 10 min')."),
      relievers: z.array(z.string()).max(5).describe("Things they say help (e.g., 'ice 20 min', 'morning Percocet with food')."),
    })
    .describe("Structured pain story pulled from the chat."),
  overallSentiment: SentimentSchema,
  sentimentTrend: z
    .array(
      z.object({
        pod: z.number().int().describe("post-op day"),
        sentiment: SentimentSchema,
        score: z
          .number()
          .min(-1)
          .max(1)
          .describe("Numeric sentiment score, -1 worst to +1 best."),
      }),
    )
    .max(14)
    .describe("One point per post-op day represented in the chat (skip days with no chat)."),
  moodTags: z
    .array(
      z.object({
        label: z
          .string()
          .describe(
            "Short emotion/state label, lowercase, max 2 words (e.g., 'anxious', 'discouraged', 'hopeful', 'frustrated').",
          ),
        weight: z
          .number()
          .min(0)
          .max(1)
          .describe("How prominent this mood is across the chat, 0–1."),
        example: z
          .string()
          .optional()
          .describe("Short patient phrase that exemplifies this mood."),
      }),
    )
    .max(6),
  keyQuotes: z
    .array(
      z.object({
        text: z.string().describe("Direct quote from the patient (verbatim, ≤ 25 words)."),
        pod: z.number().int(),
        why: z.string().optional().describe("Why this quote matters clinically."),
      }),
    )
    .max(5),
  concerns: z
    .array(
      z.object({
        topic: z.string().describe("Short topic label (e.g., 'Night pain', 'Side effects')."),
        detail: z.string().describe("1 sentence of detail from the chat."),
        pod: z.number().int(),
        severity: z.enum(["info", "warn", "critical"]),
      }),
    )
    .max(6),
  adherenceInsights: z
    .array(z.string())
    .max(5)
    .describe(
      "Bulleted observations about how the patient is following the plan (meds, walks, precautions). Each ≤ 18 words.",
    ),
  topicsForNextVisit: z
    .array(z.string())
    .max(5)
    .describe("Things the provider should raise next visit. Each ≤ 14 words."),
});

export async function GET(_req: Request, ctx: RouteContext) {
  const { patientId: raw } = await ctx.params;
  const patientId = asPatientId(raw);
  if (!patientId) {
    return Response.json({ error: "Unknown patient" }, { status: 404 });
  }

  const transcript = await readTranscript(patientId);
  if (transcript.turns.length === 0) {
    return Response.json(
      { error: "empty-transcript", message: "No chat history yet." },
      { status: 404 },
    );
  }

  const chart = getPatientChart(patientId);
  const podRange = {
    start: transcript.turns[0]?.pod ?? 0,
    end:
      transcript.turns[transcript.turns.length - 1]?.pod ??
      chart.meta.todayPod,
  };

  const transcriptText = transcript.turns
    .map((t) => `[POD ${t.pod ?? 0} · ${t.role}] ${t.content}`)
    .join("\n");

  const systemPrompt = [
    "You are an experienced orthopedic recovery analyst.",
    "You read post-op chat transcripts between a patient and a recovery coach and produce structured clinical insights for a treating provider.",
    "Be evidence-grounded: only state things the transcript or chart supports. Never invent quotes.",
    "Keep language plain, specific, and clinically useful.",
  ].join(" ");

  const userPrompt = `Patient context:
- ${chart.meta.firstName} ${chart.meta.lastName}, ${chart.meta.age}${chart.meta.sex}
- ${chart.meta.procedureLong}
- Currently POD ${chart.meta.todayPod}, expected recovery ${chart.meta.expectedRecoveryPodDays} days.
- Active meds: ${chart.medications.map((m) => `${m.drug} ${m.dose} ${m.schedule}`).join("; ")}

Patient ↔ coach chat (in chronological order):
"""
${transcriptText}
"""

Produce structured insights per the schema. Cover: how they are feeling, what their pain pattern actually is, what triggers/relievers they mention, mood across time, the 3–5 quotes that most help a provider understand them, anything they flagged that warrants attention, how they are following the plan, and what to raise next visit.`;

  try {
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-6"),
      schema: InsightsSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    });

    const insights: PatientInsights = {
      patientId,
      generatedAt: new Date().toISOString(),
      basedOnTurns: transcript.turns.length,
      basedOnPodRange: podRange,
      ...object,
    };

    return Response.json(insights);
  } catch (err) {
    console.error("[insights] generateObject failed", err);
    return Response.json(
      {
        error: "insights-failed",
        message: err instanceof Error ? err.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
