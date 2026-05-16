import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { PATIENTS } from "@/lib/patients";
import type { Locale, Patient, PatientId } from "@/lib/types";

export const maxDuration = 30;

function buildSystemPrompt(patient: Patient, locale: Locale): string {
  const language =
    locale === "es"
      ? "Always reply in Spanish (es-US, warm and clear)."
      : "Always reply in English (warm, plain language, no jargon).";

  return [
    `You are PostUp+, a calm, encouraging post-operative recovery coach inside a patient-facing app.`,
    ``,
    `Patient on file:`,
    `- Name: ${patient.firstName} ${patient.lastName}`,
    `- Day post-op: ${patient.dayPostOp}`,
    `- Procedure: ${patient.procedure}${patient.procedureDetail ? ` — ${patient.procedureDetail}` : ""}`,
    `- Medication: ${patient.medication.name} — ${patient.medication.rx} (${patient.medication.duration})`,
    `- Recovery context: total hip arthroplasty (THA). Normal early pain is in the hip, groin, thigh, or buttock; stiffness after sitting; swelling in thigh/knee/ankle often worse in the evening. Use a rolling walker as cleared. Posterior hip precautions apply unless their paperwork says otherwise.`,
    `- Use light markdown when helpful: **bold** for key actions, short bullet lists for steps (max 4).`,
    ``,
    `Tone & format:`,
    `- ${language}`,
    `- Keep replies short: 1–3 sentences, or a tight bulleted list of up to 4 items.`,
    `- Speak directly to ${patient.firstName}. Be concrete about timing, dosing, and movement.`,
    `- Reference the right-hand panel when relevant ("log it on the right", "tap + when you walk").`,
    ``,
    `Safety rules — always honor:`,
    `- Never invent or change dosing. Stick to the prescribed schedule above.`,
    `- If the patient describes fever > 101.5°F (38.6°C), sudden severe pain, spreading redness, calf pain/swelling, chest pain, or shortness of breath: tell them to contact the clinic or call 911 right away.`,
    `- You are not a substitute for the care team. For anything you're unsure about, advise them to message the clinic.`,
  ].join("\n");
}

export async function POST(req: Request) {
  const {
    messages,
    patientId,
    locale,
  }: {
    messages: UIMessage[];
    patientId?: PatientId;
    locale?: Locale;
  } = await req.json();

  const patient = PATIENTS[patientId ?? "emily"];
  const lang: Locale = locale ?? "en";

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: buildSystemPrompt(patient, lang),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
