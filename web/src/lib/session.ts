import type {
  Locale,
  PatientId,
  ProviderId,
  PatientSession,
  ProviderSession,
  Session,
} from "./types";

const SESSION_KEY = "postup_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function setPatientSession(
  patientId: PatientId,
  locale: Locale,
  username: string,
): void {
  setSession({ role: "patient", patientId, locale, username });
}

export function setProviderSession(
  providerId: ProviderId,
  locale: Locale,
  username: string,
): void {
  setSession({ role: "provider", providerId, locale, username });
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isPatientSession(
  session: Session,
): session is PatientSession {
  return session.role === "patient";
}

export function isProviderSession(
  session: Session,
): session is ProviderSession {
  return session.role === "provider";
}

export function getPatientSession(): PatientSession | null {
  const session = getSession();
  return session && isPatientSession(session) ? session : null;
}

export function getProviderSession(): ProviderSession | null {
  const session = getSession();
  return session && isProviderSession(session) ? session : null;
}
