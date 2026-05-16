export type Locale = "en" | "es";

export type UserRole = "patient" | "provider";

export type PatientId = "emily" | "gabriela";

export type ProviderId = "clinic-staff";

export interface Medication {
  name: string;
  rx: string;
  duration: string;
}

export interface MovementGoal {
  walksPerDay: number;
  minutesPerWalk: number;
}

export interface PatientAlert {
  id: string;
  type: "pain" | "medication" | "movement";
  severity: "low" | "medium" | "high";
  message: string;
}

export interface Patient {
  id: PatientId;
  firstName: string;
  lastName: string;
  mrn: string;
  username: string;
  dayPostOp: number;
  procedure: string;
  procedureDetail?: string;
  surgeon: string;
  medication: Medication;
  movementGoal: MovementGoal;
  walksToday: number;
  nextDoseIn: string;
  alerts: PatientAlert[];
}

export interface Provider {
  id: ProviderId;
  displayName: string;
  username: string;
  title: string;
}

export interface PainLevel {
  level: number;
  emoji: string;
  color: string;
  label: Record<Locale, string>;
  desc: Record<Locale, string>;
}

export interface FaqItem {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}

export type ChatSystemEvent =
  | { kind: "pain-checkin"; level: number; iso: string }
  | { kind: "walk-logged"; walksToday: number; iso: string }
  | { kind: "med-with-food"; iso: string }
  | { kind: "med-dose"; iso: string };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  /** Structured event for system messages — render with current locale. */
  event?: ChatSystemEvent;
}

export interface PatientSession {
  role: "patient";
  locale: Locale;
  patientId: PatientId;
  username: string;
}

export interface ProviderSession {
  role: "provider";
  locale: Locale;
  providerId: ProviderId;
  username: string;
}

export type Session = PatientSession | ProviderSession;

// ────────────────────────────────────────────────────────────────
// Provider chart data — read from src/data/patient-charts.json.
// Schema below is the contract the collaborator's hardcoded JSON
// push will conform to. Don't widen these without updating that file.
// ────────────────────────────────────────────────────────────────

export type FunctionalRating = "yes" | "help" | "no";

export type SymptomTag =
  | "neuropathic"
  | "swelling"
  | "nighttime"
  | "movement"
  | "skin"
  | "mood";

export interface PainEntry {
  timestamp: string; // ISO 8601
  pod: number; // post-op day, 0-based
  level: number; // 1–10
  emoji?: string;
  note?: string;
}

export interface WalkEntry {
  timestamp: string;
  pod: number;
  minutes: number;
}

export interface DoseEntry {
  timestamp: string;
  pod: number;
  drug: string;
  taken: boolean;
  withFood?: boolean;
  scheduled?: boolean; // true means this slot was expected; missing if pure ad-hoc
}

export interface FunctionalCheckEntry {
  timestamp: string;
  pod: number;
  walk: FunctionalRating;
  sit: FunctionalRating;
  stairs: FunctionalRating;
}

export interface SymptomNote {
  timestamp: string;
  pod: number;
  text: string;
  tags?: SymptomTag[];
}

export interface MedicationOrder {
  drug: string;
  dose: string;
  schedule: string;
  startPod: number;
  endPod?: number;
  status: "active" | "tapering" | "complete";
}

export interface PatientChartMeta {
  patientId: PatientId;
  firstName: string;
  lastName: string;
  mrn: string;
  age: number;
  sex: "F" | "M" | "X";
  procedure: string;
  procedureLong: string;
  surgeon: string;
  allergies: string;
  phoneMasked: string;
  language: Locale;
  surgeryDateIso: string;
  todayPod: number;
  expectedRecoveryPodDays: number;
  lastSyncIso: string;
}

export interface PatientChart {
  meta: PatientChartMeta;
  pain: PainEntry[];
  walks: WalkEntry[];
  doses: DoseEntry[];
  functional: FunctionalCheckEntry[];
  symptoms: SymptomNote[];
  medications: MedicationOrder[];
}

// ────────────────────────────────────────────────────────────────
// Provider derived data — signals, recommendations, proposed plan
// ────────────────────────────────────────────────────────────────

export type SignalSeverity = "critical" | "warn" | "info";

export type SignalSource =
  | "pain-plateau"
  | "missed-doses"
  | "low-walks"
  | "neuropathic-language"
  | "night-pain"
  | "function-regression";

export interface Signal {
  id: string;
  severity: SignalSeverity;
  source: SignalSource;
  title: Record<Locale, string>;
  detail: Record<Locale, string>;
  expected?: Record<Locale, string>;
  focusPod?: { start: number; end: number };
}

export type RecommendationKind = "primary" | "adjunct" | "taper" | "non-pharm";

export interface RxRecommendation {
  id: string;
  drug: string;
  dose: string;
  duration: string;
  rationale: Record<Locale, string>;
  evidenceQuery: string;
  relatedSignalIds: string[];
  kind: RecommendationKind;
}

export interface PlanItem {
  id: string;
  recommendationId?: string;
  drug: string;
  dose: string;
  duration: string;
  reason: string;
  addedAtIso: string;
}

// ────────────────────────────────────────────────────────────────
// Chat transcripts (real patient-side chat) + AI-derived insights
// ────────────────────────────────────────────────────────────────

export interface TranscriptTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  pod?: number;
}

export interface PatientTranscript {
  patientId: PatientId;
  turns: TranscriptTurn[];
}

export type Sentiment =
  | "very-negative"
  | "negative"
  | "neutral"
  | "positive"
  | "very-positive";

export interface SentimentPoint {
  pod: number;
  sentiment: Sentiment;
  score: number; // -1 to 1
}

export interface MoodTag {
  label: string;
  weight: number; // 0–1
  example?: string;
}

export interface KeyQuote {
  text: string;
  pod: number;
  why?: string;
}

export type ConcernSeverity = "info" | "warn" | "critical";

export interface Concern {
  topic: string;
  detail: string;
  pod: number;
  severity: ConcernSeverity;
}

export interface PainNarrativeBlock {
  pattern: string;
  triggers: string[];
  relievers: string[];
}

export interface PatientInsights {
  patientId: PatientId;
  generatedAt: string;
  basedOnTurns: number;
  basedOnPodRange: { start: number; end: number };
  narrative: string;
  painNarrative: PainNarrativeBlock;
  overallSentiment: Sentiment;
  sentimentTrend: SentimentPoint[];
  moodTags: MoodTag[];
  keyQuotes: KeyQuote[];
  concerns: Concern[];
  adherenceInsights: string[];
  topicsForNextVisit: string[];
}
