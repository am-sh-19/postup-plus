import type { PatientChart, RxRecommendation, Signal } from "./types";

function hasSignal(signals: Signal[], id: string): boolean {
  return signals.some((s) => s.id === id);
}

function meanRecentPain(chart: PatientChart): number {
  const recent = chart.pain.slice(-12);
  if (recent.length === 0) return 0;
  return recent.reduce((s, p) => s + p.level, 0) / recent.length;
}

export function buildRecommendations(
  chart: PatientChart,
  signals: Signal[],
): RxRecommendation[] {
  const recs: RxRecommendation[] = [];
  const plateau = signals.find((s) => s.id === "plateau");
  const neuropathic = hasSignal(signals, "neuropathic-language");
  const nightPain = hasSignal(signals, "night-pain");
  const recentMean = meanRecentPain(chart);

  // NSAID layer for plateau in NSAID-naive patient
  if (plateau) {
    recs.push({
      id: "rec-meloxicam",
      drug: "Meloxicam",
      dose: "15 mg PO daily",
      duration: "× 7 days, with food",
      rationale: {
        en: `Pain plateau at ~${recentMean.toFixed(1)}/10 despite scheduled opioid — layered NSAID often shifts a stalled recovery in NSAID-naive patients with no renal or GI flag.`,
        es: `Meseta de dolor ~${recentMean.toFixed(1)}/10 a pesar de opioide programado — agregar AINE suele desbloquear la recuperación en pacientes sin riesgo renal ni GI.`,
      },
      evidenceQuery:
        "evidence for adding NSAID adjunct (meloxicam) for plateaued post-ACL pain at POD 5–7",
      relatedSignalIds: ["plateau"],
      kind: "adjunct",
    });
  }

  // Gabapentin for neuropathic-quality + night pain
  if (neuropathic || nightPain) {
    const refs = [neuropathic ? "neuropathic-language" : null, nightPain ? "night-pain" : null]
      .filter((x): x is string => x !== null);
    recs.push({
      id: "rec-gabapentin",
      drug: "Gabapentin",
      dose: "100 mg PO QHS",
      duration: "titrate up to 300 mg QHS over 5 nights",
      rationale: {
        en: "Patient reports burning/shooting pain (neuropathic descriptors) with night-time disruption. Low-dose gabapentin nightly is a reasonable adjunct with a benign side-effect profile at this dose.",
        es: "Paciente reporta dolor ardiente/punzante (descriptores neuropáticos) con interrupción nocturna. Gabapentina nocturna a dosis baja es un adyuvante razonable con buen perfil.",
      },
      evidenceQuery:
        "gabapentin low-dose adjunct for neuropathic post-op pain with night-time disruption",
      relatedSignalIds: refs,
      kind: "adjunct",
    });
  }

  // Opioid taper plan as a non-pharm/structural rec when adherence is poor or plateau dragging
  if (plateau || hasSignal(signals, "missed-doses")) {
    recs.push({
      id: "rec-percocet-taper",
      drug: "Percocet 5/325 mg",
      dose: "structured taper",
      duration: "1 tab q6h prn → q8h by POD 10 → q12h by POD 14",
      rationale: {
        en: "Patient already skipping doses (adherence signal). Replace prn cycle with structured taper while the NSAID/gabapentin adjuncts ramp — cleaner sleep, fewer side-effects.",
        es: "Paciente omite dosis (señal de adherencia). Reemplace el ciclo prn con descenso estructurado mientras los adyuvantes suben — mejor sueño, menos efectos secundarios.",
      },
      evidenceQuery:
        "structured opioid taper for post-ACL recovery at POD 7 with NSAID + gabapentin adjunct",
      relatedSignalIds: ["plateau", "missed-doses"].filter((id) =>
        hasSignal(signals, id),
      ),
      kind: "taper",
    });
  }

  // PT escalation as a non-pharm rec if function is regressing
  if (hasSignal(signals, "function-regression") || hasSignal(signals, "low-walks")) {
    recs.push({
      id: "rec-pt-escalate",
      drug: "PT escalation",
      dose: "+ 2 sessions / week",
      duration: "review at POD 14",
      rationale: {
        en: "Ambulation and walk-across-room rating are slipping. A near-term PT bump usually flips the activity curve back up without medication changes.",
        es: "La ambulación y la prueba funcional están bajando. Un aumento corto de fisioterapia suele revertir la curva sin cambios de medicación.",
      },
      evidenceQuery:
        "increased physical therapy frequency to reverse functional regression at POD 7 post-ACL",
      relatedSignalIds: ["function-regression", "low-walks"].filter((id) =>
        hasSignal(signals, id),
      ),
      kind: "non-pharm",
    });
  }

  return recs;
}
