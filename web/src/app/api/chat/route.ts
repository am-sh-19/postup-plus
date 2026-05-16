import { getPatient } from "@/lib/data";
import type { Locale, PatientId } from "@/lib/types";

const MOCK_REPLIES: Record<Locale, string[]> = {
  en: [
    "That's common after surgery. Ice for 20 minutes and keep the limb elevated when resting.",
    "For your medication: take Percocet every 6 hours with food — not more often. Log doses in the sidebar.",
    "Try a short 5-minute walk if you're due. Movement every hour helps stiffness and circulation.",
    "If pain suddenly worsens, you have fever over 101.5°F, or spreading redness, contact the clinic right away.",
  ],
  es: [
    "Es común después de la cirugía. Hielo 20 minutos y mantenga la extremidad elevada al descansar.",
    "Para su medicamento: tome Percocet cada 6 horas con comida — no con más frecuencia. Registre las dosis en el panel.",
    "Intente caminar 5 minutos si le toca. Moverse cada hora ayuda con la rigidez y la circulación.",
    "Si el dolor empeora de repente, tiene fiebre mayor de 38.6°C o enrojecimiento que se extiende, llame a la clínica de inmediato.",
  ],
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    patientId?: PatientId;
    locale?: Locale;
  };

  const message = body.message?.trim() ?? "";
  const patientId = body.patientId ?? "emily";
  const locale = body.locale ?? "en";
  const patient = getPatient(patientId);

  if (!message) {
    return Response.json({ error: "Message required" }, { status: 400 });
  }

  const lower = message.toLowerCase();
  let reply: string;

  if (
    lower.includes("shower") ||
    lower.includes("ducha") ||
    lower.includes("baño")
  ) {
    reply =
      locale === "es"
        ? "Mantenga la incisión seca hasta el día 14. Solo baño de esponja hasta que retiren las suturas."
        : "Keep the incision dry until day 14. Sponge bathe only until sutures are removed.";
  } else if (
    lower.includes("percocet") ||
    lower.includes("med") ||
    lower.includes("medic")
  ) {
    reply =
      locale === "es"
        ? `${patient.medication.name}: una tableta cada 6 horas con comida durante 3 semanas. Use los botones del panel para registrar cada dosis.`
        : `${patient.medication.name}: one tablet every 6 hours with food for 3 weeks. Use the sidebar buttons to log each dose.`;
  } else if (lower.includes("walk") || lower.includes("camin")) {
    reply =
      locale === "es"
        ? "Camine unos 5 minutos cada hora. Toque + en Movimiento de hoy o Registre caminata en el banner verde."
        : "Walk about 5 minutes every hour. Tap + in Today's movement or Log walk on the green banner.";
  } else {
    const pool = MOCK_REPLIES[locale];
    reply = pool[Math.floor(Math.random() * pool.length)]!;
  }

  return Response.json({
    reply,
    meta: { patientId, locale, poweredBy: "postup-demo" },
  });
}
