export type Locale = "en" | "es";

export type UserRole = "patient" | "provider";

export type PatientId = "emily" | "gabriela";

export interface Patient {
  id: PatientId;
  firstName: string;
  lastName: string;
  mrn: string;
  dayPostOp: number;
  procedure: string;
  medication: {
    name: string;
    rx: string;
    duration: string;
  };
}

export interface PainLevel {
  emoji: string;
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
}

export interface ProviderSession {
  role: "provider";
  locale: Locale;
}

export type Session = PatientSession | ProviderSession;
