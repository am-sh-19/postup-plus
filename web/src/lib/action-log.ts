import { getPainLevel } from "./data";
import type { ChatSystemEvent, Locale } from "./types";

/** Formats a time in US Eastern (handles EST/EDT via timeZone). */
export function formatEstTimestamp(date = new Date(), locale: Locale = "en"): string {
  const localeTag = locale === "es" ? "es-US" : "en-US";
  const time = new Intl.DateTimeFormat(localeTag, {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${time} EST`;
}

export function painCheckInMessage(
  level: number,
  label: string,
  locale: Locale,
  at = new Date(),
): string {
  const when = formatEstTimestamp(at, locale);
  if (locale === "es") {
    return `Usuario reportó dolor nivel **${level}** (${label}) a las ${when}.`;
  }
  return `User reported pain level **${level}** (${label}) at ${when}.`;
}

export function walkLoggedMessage(
  walksToday: number,
  locale: Locale,
  at = new Date(),
): string {
  const when = formatEstTimestamp(at, locale);
  if (locale === "es") {
    return `Caminata de 5 min registrada a las ${when}. **${walksToday}** caminatas hoy — siga moviéndose cada hora.`;
  }
  return `5-minute walk logged at ${when}. **${walksToday}** walks today — keep moving every hour.`;
}

export function medWithFoodMessage(locale: Locale, at = new Date()): string {
  const when = formatEstTimestamp(at, locale);
  if (locale === "es") {
    return `Percocet registrado con comida a las ${when}. Recuerde: cada 6 horas, no antes.`;
  }
  return `Percocet logged with food at ${when}. Remember: every 6 hours, not sooner.`;
}

export function medDoseMessage(locale: Locale, at = new Date()): string {
  const when = formatEstTimestamp(at, locale);
  if (locale === "es") {
    return `Dosis de Percocet marcada (5/325 mg) a las ${when}. Próxima dosis en ~6 horas — con comida.`;
  }
  return `Percocet dose marked taken (5/325 mg) at ${when}. Next dose in about 6 hours — take with food.`;
}

/**
 * Render a structured ChatSystemEvent in the active locale. Use this when
 * rendering persisted system messages so they retranslate as the user
 * switches between EN/ES.
 */
export function renderSystemEvent(
  event: ChatSystemEvent,
  locale: Locale,
): string {
  const at = new Date(event.iso);
  switch (event.kind) {
    case "pain-checkin": {
      const label = getPainLevel(event.level, locale).label[locale];
      return painCheckInMessage(event.level, label, locale, at);
    }
    case "walk-logged":
      return walkLoggedMessage(event.walksToday, locale, at);
    case "med-with-food":
      return medWithFoodMessage(locale, at);
    case "med-dose":
      return medDoseMessage(locale, at);
  }
}
