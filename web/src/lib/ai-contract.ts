// SSE contract for the provider AI surfaces. The route handlers
// (`/api/clinical-lookup`, `/api/rx-rationale`) are implemented by a
// separate agent. UI components fetch against the endpoints below and
// parse the streamed events defined here. Keep both sides in sync.

import type { PatientChart, RxRecommendation, Signal } from "./types";

export const ENDPOINTS = {
  clinicalLookup: "/api/clinical-lookup",
  rxRationale: "/api/rx-rationale",
} as const;

/** Authoritative medical domains for the Anthropic web_search tool. */
export const MEDICAL_DOMAINS = [
  "pubmed.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "nih.gov",
  "cdc.gov",
  "mayoclinic.org",
  "uptodate.com",
  "medscape.com",
  "aafp.org",
  "who.int",
  "cochranelibrary.com",
  "nejm.org",
  "jamanetwork.com",
  "bmj.com",
  "thelancet.com",
  "acpjournals.org",
  "aaos.org",
] as const;

export interface ClinicalLookupRequest {
  query: string;
  context: {
    patientChart: PatientChart;
    signals: Signal[];
  };
}

export interface RxRationaleRequest {
  recommendation: RxRecommendation;
  context: {
    patientChart: PatientChart;
    signals: Signal[];
  };
}

export interface ContractCitation {
  title: string;
  url: string;
  cited_text?: string;
}

export type ContractEvent =
  | { type: "searching"; query: string }
  | { type: "text_delta"; text: string }
  | { type: "done"; citations: ContractCitation[] }
  | { type: "error"; error: string };

/** Parse a single SSE `data: {...}` line into a ContractEvent. */
export function parseContractEvent(line: string): ContractEvent | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload) return null;
  try {
    return JSON.parse(payload) as ContractEvent;
  } catch {
    return null;
  }
}
