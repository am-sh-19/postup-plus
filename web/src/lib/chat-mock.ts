import type { Locale, Patient } from "@/lib/types";

function lastUserText(messages: { role: string; parts?: { type: string; text?: string }[] }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    return (
      m.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("") ?? ""
    ).toLowerCase();
  }
  return "";
}

/** Demo replies when ANTHROPIC_API_KEY is not set (hackathon / Vercel preview). */
export function generateMockReply(
  patient: Patient,
  locale: Locale,
  messages: { role: string; parts?: { type: string; text?: string }[] }[],
): string {
  const q = lastUserText(messages);
  const name = patient.firstName;
  const med = patient.medication.name;

  if (locale === "es") {
    if (/fiebre|101|38\.6|emergencia|911|pecho|falta de aire/.test(q)) {
      return `**${name}**, eso puede ser urgente. Llame al consultorio ahora o al **911** si tiene dificultad para respirar, dolor en el pecho o fiebre alta que no baja.`;
    }
    if (/dolor|duele|ardor|10\/10|fuerte/.test(q)) {
      return `Entiendo, ${name}. Si el dolor es **peor que ayer** o no mejora con su medicación según lo recetado, use el panel derecho para **registrar el dolor** y contacte al consultorio.\n\nMientras tanto: reposo con la cadera en posición segura, hielo 15–20 min si se lo indicaron, y **no tome dosis extra** de ${med}.`;
    }
    if (/camin|caminar|andar|walker|andador/.test(q)) {
      return `Buena pregunta. Camine **corto y seguido** con el andador como le indicaron — suele ser cada hora o lo que diga su hoja.\n\nToque **+** en “Movimiento” a la derecha cuando termine una vuelta; eso nos ayuda a ver su progreso.`;
    }
    if (/pastilla|medic|percocet|dosis|comida/.test(q)) {
      return `Su ${med} va **cada 6 horas con comida**, no antes. Use los botones del panel de medicación a la derecha para registrar **con comida** o **dosis tomada**.`;
    }
    if (/precaucion|posterior|flexion|doblar/.test(q)) {
      return `Con enfoque **posterior**, evite flexionar la cadera más de 90°, cruzar las piernas o rotar la pierna operada hacia adentro. Si algo en su papel dice otra cosa, siga ese papel.`;
    }
    return `Gracias, ${name}. Lo tengo anotado. Use el panel derecho para **dolor**, **caminatas** y **medicación** — su equipo puede ver esos registros.\n\n¿Hay algo más sobre su cadera hoy?`;
  }

  if (/fever|101|38\.6|emergency|911|chest|breath|shortness/.test(q)) {
    return `**${name}**, that may need urgent care. Call the clinic now, or **911** if you have trouble breathing, chest pain, or a high fever that won't come down.`;
  }
  if (/pain|hurt|aching|sore|10\/10|sharp/.test(q)) {
    return `I hear you, ${name}. If pain is **worse than yesterday** or not manageable on your prescribed schedule, log it on the right with **Pain** and contact the clinic.\n\nFor now: rest with safe hip positioning, ice 15–20 min if you were told to, and **don't take extra** ${med}.`;
  }
  if (/walk|walker|mobility|steps/.test(q)) {
    return `Short, frequent walks with your **walker** are key — usually about every hour unless your sheet says otherwise.\n\nTap **+** under Movement on the right when you finish a lap; that helps your team track progress.`;
  }
  if (/pill|med|percocet|dose|food|nausea/.test(q)) {
    return `Your ${med} is **every 6 hours with food** — not sooner. Use the medication panel on the right to log **taken with food** or **dose taken**.`;
  }
  if (/precaution|posterior|bend|flex/.test(q)) {
    return `With a **posterior** approach, avoid bending the hip past 90°, crossing your legs, or turning the operated leg inward. If your paperwork differs, follow your paperwork.`;
  }
  return `Thanks, ${name} — noted. Use the right-hand panel to log **pain**, **walks**, and **meds** so your care team can see it.\n\nAnything else about your hip today?`;
}
