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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
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
