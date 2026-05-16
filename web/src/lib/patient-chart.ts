// Patient chart loader. The underlying JSON at `src/data/patient-charts.json`
// is the shared ground-truth data store — a collaborator is overwriting this
// file with the canonical hardcoded chart data. Keep the keys (patientId) and
// the PatientChart shape stable so consumers in this module continue to work.

import chartsJson from "@/data/patient-charts.json";
import type { PatientChart, PatientId } from "./types";

const CHARTS = chartsJson as unknown as Record<PatientId, PatientChart>;

export function getPatientChart(patientId: PatientId): PatientChart {
  const chart = CHARTS[patientId];
  if (!chart) {
    throw new Error(`No chart for patient "${patientId}"`);
  }
  return chart;
}

export function listPatientCharts(): PatientChart[] {
  return Object.values(CHARTS);
}
