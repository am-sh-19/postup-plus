import clinicData from "@/data/clinic-data.json";
import type {
  Locale,
  PainLevel,
  Patient,
  PatientId,
  Provider,
  ProviderId,
} from "./types";

export type ClinicData = typeof clinicData;

export const CLINIC_DATA = clinicData;

export function getClinicName(): string {
  return clinicData.clinic.name;
}

export function getPatients(): Patient[] {
  return clinicData.patients as Patient[];
}

export function getPatient(id: PatientId): Patient {
  const patient = clinicData.patients.find((p) => p.id === id);
  if (!patient) throw new Error(`Unknown patient: ${id}`);
  return patient as Patient;
}

export function getPatientByUsername(username: string): Patient | null {
  const normalized = username.trim().toLowerCase();
  const found = clinicData.patients.find(
    (p) => p.username.toLowerCase() === normalized,
  );
  return found ? (found as Patient) : null;
}

export function getProviders(): Provider[] {
  return clinicData.providers as Provider[];
}

export function getProvider(id: ProviderId): Provider {
  const provider = clinicData.providers.find((p) => p.id === id);
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider as Provider;
}

/** Map for legacy `PATIENTS[id]` access */
export function getPatientsRecord(): Record<PatientId, Patient> {
  return Object.fromEntries(
    getPatients().map((p) => [p.id, p]),
  ) as Record<PatientId, Patient>;
}

export function getPainScale(): PainLevel[] {
  return clinicData.painScale as PainLevel[];
}

export function getPainLevel(level: number, locale: Locale): PainLevel {
  const entry = getPainScale().find((p) => p.level === level);
  return entry ?? getPainScale()[4]!;
}
