import type { Patient } from "./types";

export const PATIENTS: Record<string, Patient> = {
  emily: {
    id: "emily",
    firstName: "Emily",
    lastName: "Person",
    mrn: "MRN-48291",
    dayPostOp: 7,
    procedure: "ACL reconstruction",
    medication: {
      name: "Percocet 5/325 mg",
      rx: "1 tablet every 6 hours as needed for pain",
      duration: "Prescribed for 3 weeks post-op",
    },
  },
  gabriela: {
    id: "gabriela",
    firstName: "Gabriela",
    lastName: "Martinez",
    mrn: "MRN-71903",
    dayPostOp: 5,
    procedure: "rotator cuff repair",
    medication: {
      name: "Percocet 5/325 mg",
      rx: "1 tablet every 6 hours as needed for pain",
      duration: "Prescribed for 3 weeks post-op",
    },
  },
};

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
