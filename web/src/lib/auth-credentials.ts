import type { PatientId, ProviderId, UserRole } from "./types";

/** Demo login accounts — replace with real auth in production */
export interface AuthAccount {
  role: UserRole;
  username: string;
  password: string;
  patientId?: PatientId;
  providerId?: ProviderId;
  label: string;
}

export const AUTH_ACCOUNTS: AuthAccount[] = [
  {
    role: "patient",
    username: "emily.person",
    password: "patient123",
    patientId: "emily",
    label: "Emily Person (patient)",
  },
  {
    role: "patient",
    username: "gabriela.martinez",
    password: "patient123",
    patientId: "gabriela",
    label: "Gabriela Martinez (patient)",
  },
  {
    role: "provider",
    username: "provider",
    password: "clinic123",
    providerId: "clinic-staff",
    label: "Clinic staff (provider)",
  },
];

export function authenticate(
  username: string,
  password: string,
  role: UserRole,
): AuthAccount | null {
  const normalizedUser = username.trim().toLowerCase();
  return (
    AUTH_ACCOUNTS.find(
      (a) =>
        a.role === role &&
        a.username.toLowerCase() === normalizedUser &&
        a.password === password,
    ) ?? null
  );
}

export function demoHintForRole(role: UserRole): string {
  if (role === "patient") {
    return "Demo: emily.person / patient123 · gabriela.martinez / patient123";
  }
  return "Demo: provider / clinic123";
}
