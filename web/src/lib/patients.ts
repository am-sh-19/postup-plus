import { getPatientsRecord } from "./data";
import type { Patient } from "./types";

export {
  getPatient,
  getPatientByUsername,
  getPatients,
  getPatientsRecord,
} from "./data";

export const PATIENTS = getPatientsRecord();

export function findPatient(lastName: string, mrn: string): Patient | null {
  const normalizedLast = lastName.trim().toLowerCase();
  const normalizedMrn = mrn.trim().toUpperCase();
  return (
    Object.values(PATIENTS).find(
      (p) =>
        p.lastName.toLowerCase() === normalizedLast &&
        p.mrn.toUpperCase() === normalizedMrn,
    ) ?? null
  );
}
