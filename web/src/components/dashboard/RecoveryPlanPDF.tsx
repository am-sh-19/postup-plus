"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Locale, Patient } from "@/lib/types";

const COLORS = {
  navy: "#021f53",
  navyDeep: "#011640",
  ink: "#1a2746",
  blue: "#2a8ce0",
  blueDark: "#0f74d6",
  green: "#2aae72",
  greenSoft: "#e6f4ea",
  bg: "#f6f8fc",
  bgSoft: "#eef3fa",
  panel: "#ffffff",
  border: "#dde4ef",
  muted: "#5c6b80",
  warning: "#b45309",
  warningSoft: "#fef3c7",
  danger: "#b91c1c",
  dangerSoft: "#fee2e2",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    backgroundColor: COLORS.bg,
    fontFamily: "Helvetica",
    color: COLORS.ink,
    fontSize: 10,
    lineHeight: 1.45,
  },
  hero: {
    backgroundColor: COLORS.navy,
    color: "#ffffff",
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 28,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brandWord: {
    fontFamily: "Times-Italic",
    fontSize: 26,
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  brandPlus: {
    color: "#7fc8ff",
  },
  brandTag: {
    fontSize: 8,
    color: "#aac6ee",
    letterSpacing: 1.6,
    marginTop: 4,
    textTransform: "uppercase",
  },
  heroMeta: { alignItems: "flex-end" },
  heroMetaLabel: {
    fontSize: 7,
    color: "#7fa9d9",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  heroMetaValue: {
    fontSize: 10,
    color: "#ffffff",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Times-Roman",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 11,
    color: "#bcd2ef",
    marginTop: 6,
    maxWidth: 360,
  },

  body: {
    paddingHorizontal: 40,
    paddingTop: 24,
    flexDirection: "column",
    gap: 14,
  },

  patientCard: {
    flexDirection: "row",
    backgroundColor: COLORS.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: -38,
    marginBottom: 6,
  },
  patientCol: { flex: 1, paddingHorizontal: 8 },
  patientColDivider: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  patientLabel: {
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  patientValue: {
    fontSize: 12,
    color: COLORS.navy,
    fontFamily: "Helvetica-Bold",
  },
  patientValueSmall: {
    fontSize: 10,
    color: COLORS.ink,
    marginTop: 1,
  },

  section: {
    backgroundColor: COLORS.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionEyebrow: {
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "Times-Roman",
    fontSize: 16,
    color: COLORS.navy,
    letterSpacing: -0.2,
  },
  sectionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.navy,
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 5,
  },

  prose: { fontSize: 10, color: COLORS.ink, marginTop: 4 },
  proseMuted: { color: COLORS.muted, fontSize: 9, marginTop: 4 },

  // Medication grid
  medRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 6,
    gap: 10,
  },
  medCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.bgSoft,
  },
  medName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.navy,
  },
  medRx: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  medChip: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    color: COLORS.blueDark,
    fontFamily: "Helvetica-Bold",
  },

  scheduleGrid: {
    flexDirection: "row",
    marginTop: 10,
    gap: 4,
  },
  scheduleSlot: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  scheduleTime: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  scheduleNote: { fontSize: 7, color: COLORS.muted, marginTop: 2 },

  // Bullet rows
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.blue,
    marginTop: 5,
  },
  bulletText: { flex: 1, fontSize: 10, color: COLORS.ink },
  bulletStrong: { fontFamily: "Helvetica-Bold", color: COLORS.navy },

  // Movement
  movementRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  movementCard: {
    flex: 1,
    backgroundColor: COLORS.greenSoft,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.green,
  },
  movementValue: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  movementLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginTop: 1,
  },
  movementHint: { fontSize: 9, color: COLORS.ink, marginTop: 4 },

  // Recent activity table
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: COLORS.bgSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeadCell: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },
  tableCell: { fontSize: 9, color: COLORS.ink },

  // Warnings
  warning: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.dangerSoft,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    marginTop: 6,
  },
  warningTitle: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.danger,
    fontSize: 10,
  },
  warningText: { color: COLORS.ink, fontSize: 9, marginTop: 2 },

  // Footer
  signRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signCol: { flex: 1 },
  signLine: {
    height: 1,
    backgroundColor: COLORS.ink,
    marginTop: 18,
  },
  signLabel: { fontSize: 8, color: COLORS.muted, marginTop: 4 },

  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: COLORS.muted,
  },
});

const COPY: Record<
  Locale,
  {
    documentTitle: string;
    documentSubtitle: string;
    generated: string;
    pod: string;
    procedure: string;
    surgeon: string;
    sec1: string;
    sec1Title: string;
    sec1Body: string;
    sec2: string;
    sec2Title: string;
    sec2Intro: string;
    rxFor: string;
    timing: string;
    timingItems: string[];
    schedule: string;
    scheduleNote: string;
    todayLabel: string;
    sec3: string;
    sec3Title: string;
    sec3Intro: string;
    walksDay: string;
    minWalk: string;
    targetToday: string;
    movementBullets: string[];
    sec4: string;
    sec4Title: string;
    activityRecent: string;
    cols: { when: string; what: string; detail: string };
    rows: Array<{ when: string; what: string; detail: string }>;
    sec5: string;
    sec5Title: string;
    warningTitle: string;
    warningBody: string;
    callTitle: string;
    callBody: string;
    sec6: string;
    sec6Title: string;
    sec6Body: string;
    patient: string;
    careTeam: string;
    notForEmergency: string;
    pageOf: (page: number, total: number) => string;
  }
> = {
  en: {
    documentTitle: "Personal Recovery Plan",
    documentSubtitle:
      "Generated from your clinic chart. Bring this to follow-up appointments or share with anyone helping you recover.",
    generated: "Generated",
    pod: "Post-op day",
    procedure: "Procedure",
    surgeon: "Surgeon",
    sec1: "01",
    sec1Title: "Where you are right now",
    sec1Body:
      "You're on the path most patients take after this procedure. Soreness, stiffness, and some swelling are expected — what matters is gentle, regular movement and not skipping doses while pain is high.",
    sec2: "02",
    sec2Title: "Pain management",
    sec2Intro: "Your prescribed plan, exactly as written in your chart.",
    rxFor: "Prescribed for",
    timing: "How to take it",
    timingItems: [
      "Take with food — a few crackers or a small snack is enough.",
      "Wait at least 6 hours between doses; never double up.",
      "If pain stays under 4/10, you can space doses out or skip.",
    ],
    schedule: "Suggested schedule for today",
    scheduleNote: "Adjust to your sleep and meals — these are starting points.",
    todayLabel: "Today",
    sec3: "03",
    sec3Title: "Movement plan",
    sec3Intro:
      "Short, frequent walks beat one long walk. Movement keeps swelling down and prevents stiffness.",
    walksDay: "Walks per day",
    minWalk: "Min. each",
    targetToday: "Goal today",
    movementBullets: [
      "Stand up and move at least once every hour you're awake.",
      "Use ice for 20 minutes after each walking session if swollen.",
      "Elevate the operated limb above heart level while resting.",
    ],
    sec4: "04",
    sec4Title: "Your recent activity",
    activityRecent: "Pulled from the last 48 hours on your chart.",
    cols: { when: "When", what: "What", detail: "Notes" },
    rows: [
      { when: "Today, 08:42", what: "Pain check-in", detail: "5/10 — within expected range" },
      { when: "Today, 07:15", what: "Percocet dose", detail: "Logged with food" },
      { when: "Today, 06:50", what: "Walk", detail: "5 min, around the kitchen" },
      { when: "Yesterday, 21:10", what: "Percocet dose", detail: "Logged before bed" },
      { when: "Yesterday, 20:00", what: "Walk", detail: "6 min, light stairs" },
    ],
    sec5: "05",
    sec5Title: "Call us if",
    warningTitle: "Call 911 right away if",
    warningBody:
      "You have chest pain, sudden shortness of breath, sudden severe calf pain or swelling, or you feel faint.",
    callTitle: "Call the clinic same-day for",
    callBody:
      "Fever over 101.5°F (38.6°C), spreading redness or warmth at the incision, drainage that wasn't there yesterday, or pain that suddenly jumps and doesn't come down with rest and ice.",
    sec6: "06",
    sec6Title: "Your care team",
    sec6Body:
      "Your surgeon and the PostUp+ clinic team can see your check-ins, pain logs, and medication times. Message us anytime in the app — we usually reply within a few hours during clinic days.",
    patient: "Patient signature",
    careTeam: "Care team",
    notForEmergency:
      "This document is for reference. It is not a substitute for emergency care. In an emergency, call 911.",
    pageOf: (page, total) => `Page ${page} of ${total}`,
  },
  es: {
    documentTitle: "Plan de recuperación personal",
    documentSubtitle:
      "Generado desde su expediente. Llévelo a las citas de seguimiento o compártalo con quien le esté ayudando.",
    generated: "Generado",
    pod: "Día post-op",
    procedure: "Procedimiento",
    surgeon: "Cirujano",
    sec1: "01",
    sec1Title: "Dónde está ahora",
    sec1Body:
      "Está en el camino normal después de este procedimiento. La molestia, rigidez y algo de hinchazón son esperados — lo importante es moverse poco y seguido, sin saltarse dosis cuando el dolor está alto.",
    sec2: "02",
    sec2Title: "Manejo del dolor",
    sec2Intro: "Su plan prescrito, exactamente como está en su expediente.",
    rxFor: "Prescrito por",
    timing: "Cómo tomarlo",
    timingItems: [
      "Tómelo con comida — unas galletas o un bocadillo bastan.",
      "Espere al menos 6 horas entre dosis; nunca duplique.",
      "Si el dolor es menor a 4/10, puede espaciar o saltar la dosis.",
    ],
    schedule: "Horario sugerido para hoy",
    scheduleNote:
      "Ajuste a su sueño y comidas — son solo puntos de partida.",
    todayLabel: "Hoy",
    sec3: "03",
    sec3Title: "Plan de movimiento",
    sec3Intro:
      "Caminatas cortas y frecuentes son mejores que una larga. El movimiento reduce hinchazón y previene rigidez.",
    walksDay: "Caminatas por día",
    minWalk: "Min. cada una",
    targetToday: "Meta de hoy",
    movementBullets: [
      "Levántese y muévase al menos una vez por hora despierta.",
      "Use hielo 20 minutos después de cada caminata si hay hinchazón.",
      "Eleve la extremidad operada por encima del corazón al descansar.",
    ],
    sec4: "04",
    sec4Title: "Su actividad reciente",
    activityRecent: "Tomado de las últimas 48 horas de su expediente.",
    cols: { when: "Cuándo", what: "Qué", detail: "Notas" },
    rows: [
      { when: "Hoy, 08:42", what: "Registro de dolor", detail: "5/10 — dentro del rango esperado" },
      { when: "Hoy, 07:15", what: "Dosis de Percocet", detail: "Registrada con comida" },
      { when: "Hoy, 06:50", what: "Caminata", detail: "5 min, alrededor de la cocina" },
      { when: "Ayer, 21:10", what: "Dosis de Percocet", detail: "Registrada antes de dormir" },
      { when: "Ayer, 20:00", what: "Caminata", detail: "6 min, escaleras suaves" },
    ],
    sec5: "05",
    sec5Title: "Llámenos si",
    warningTitle: "Llame al 911 de inmediato si",
    warningBody:
      "Tiene dolor en el pecho, falta de aire repentina, dolor o hinchazón severa repentina en la pantorrilla, o se siente desmayar.",
    callTitle: "Llame a la clínica el mismo día por",
    callBody:
      "Fiebre mayor de 38.6 °C, enrojecimiento o calor que se extiende en la incisión, drenaje que no estaba ayer, o dolor que sube de repente y no baja con descanso y hielo.",
    sec6: "06",
    sec6Title: "Su equipo de atención",
    sec6Body:
      "Su cirujano y el equipo de PostUp+ pueden ver sus chequeos, registros de dolor y dosis. Escríbanos en la app — solemos responder en horas durante los días de clínica.",
    patient: "Firma del paciente",
    careTeam: "Equipo de atención",
    notForEmergency:
      "Este documento es de referencia. No reemplaza atención de emergencia. En emergencia, llame al 911.",
    pageOf: (page, total) => `Página ${page} de ${total}`,
  },
};

function formatToday(locale: Locale): string {
  const now = new Date();
  return now.toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function suggestedTimes(): Array<{ time: string; note: string }> {
  return [
    { time: "07:00", note: "with breakfast" },
    { time: "13:00", note: "with lunch" },
    { time: "19:00", note: "with dinner" },
    { time: "01:00", note: "if waking" },
  ];
}

interface RecoveryPlanPDFProps {
  patient: Patient;
  locale: Locale;
}

export function RecoveryPlanPDF({ patient, locale }: RecoveryPlanPDFProps) {
  const c = COPY[locale];
  const today = formatToday(locale);
  const times = suggestedTimes();

  return (
    <Document
      title={`PostUp+ Recovery Plan — ${patient.firstName} ${patient.lastName}`}
      author="PostUp+ Orthopedic Recovery"
      subject="Personalized post-operative care plan"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.hero} fixed>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.brandWord}>
                PostUp<Text style={styles.brandPlus}>+</Text>
              </Text>
              <Text style={styles.brandTag}>
                Orthopedic recovery, with you
              </Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaLabel}>{c.generated}</Text>
              <Text style={styles.heroMetaValue}>{today}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{c.documentTitle}</Text>
          <Text style={styles.heroSubtitle}>{c.documentSubtitle}</Text>
        </View>

        <View style={styles.body}>
          {/* Patient card overlapping the hero */}
          <View style={styles.patientCard}>
            <View style={styles.patientCol}>
              <Text style={styles.patientLabel}>Patient</Text>
              <Text style={styles.patientValue}>
                {patient.firstName} {patient.lastName}
              </Text>
              <Text style={styles.patientValueSmall}>{patient.mrn}</Text>
            </View>
            <View style={[styles.patientCol, styles.patientColDivider]}>
              <Text style={styles.patientLabel}>{c.procedure}</Text>
              <Text style={styles.patientValue}>{patient.procedure}</Text>
              <Text style={styles.patientValueSmall}>
                {c.surgeon}: {patient.surgeon}
              </Text>
            </View>
            <View style={[styles.patientCol, styles.patientColDivider]}>
              <Text style={styles.patientLabel}>{c.pod}</Text>
              <Text style={styles.patientValue}>
                Day {patient.dayPostOp}
              </Text>
              <Text style={styles.patientValueSmall}>
                of recovery
              </Text>
            </View>
          </View>

          {/* Section 1 — narrative */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>{c.sec1}</Text>
              <View>
                <Text style={styles.sectionEyebrow}>Overview</Text>
                <Text style={styles.sectionTitle}>{c.sec1Title}</Text>
              </View>
            </View>
            <Text style={styles.prose}>{c.sec1Body}</Text>
          </View>

          {/* Section 2 — medication */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>{c.sec2}</Text>
              <View>
                <Text style={styles.sectionEyebrow}>Plan</Text>
                <Text style={styles.sectionTitle}>{c.sec2Title}</Text>
              </View>
            </View>
            <Text style={styles.proseMuted}>{c.sec2Intro}</Text>

            <View style={styles.medRow}>
              <View style={styles.medCard}>
                <Text style={styles.medName}>{patient.medication.name}</Text>
                <Text style={styles.medRx}>{patient.medication.rx}</Text>
                <Text style={styles.medChip}>{patient.medication.duration}</Text>
              </View>
              <View style={styles.medCard}>
                <Text style={[styles.sectionEyebrow, { marginBottom: 4 }]}>
                  {c.timing}
                </Text>
                {c.timingItems.map((item, i) => (
                  <View style={styles.bulletRow} key={i}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.sectionEyebrow, { marginTop: 12 }]}>
              {c.schedule}
            </Text>
            <View style={styles.scheduleGrid}>
              {times.map((slot) => (
                <View key={slot.time} style={styles.scheduleSlot}>
                  <Text style={styles.scheduleTime}>{slot.time}</Text>
                  <Text style={styles.scheduleNote}>{slot.note}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.proseMuted, { marginTop: 6 }]}>
              {c.scheduleNote}
            </Text>
          </View>

          {/* Section 3 — movement */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>{c.sec3}</Text>
              <View>
                <Text style={styles.sectionEyebrow}>Plan</Text>
                <Text style={styles.sectionTitle}>{c.sec3Title}</Text>
              </View>
            </View>
            <Text style={styles.prose}>{c.sec3Intro}</Text>

            <View style={styles.movementRow}>
              <View style={styles.movementCard}>
                <Text style={styles.movementValue}>
                  {patient.movementGoal.walksPerDay}
                </Text>
                <Text style={styles.movementLabel}>{c.walksDay}</Text>
              </View>
              <View style={styles.movementCard}>
                <Text style={styles.movementValue}>
                  {patient.movementGoal.minutesPerWalk}
                  <Text style={{ fontSize: 12, color: COLORS.muted }}> min</Text>
                </Text>
                <Text style={styles.movementLabel}>{c.minWalk}</Text>
              </View>
              <View style={styles.movementCard}>
                <Text style={styles.movementValue}>
                  {patient.walksToday}
                  <Text style={{ fontSize: 12, color: COLORS.muted }}>
                    {" "}
                    / {patient.movementGoal.walksPerDay}
                  </Text>
                </Text>
                <Text style={styles.movementLabel}>{c.targetToday}</Text>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              {c.movementBullets.map((b, i) => (
                <View style={styles.bulletRow} key={i}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 4 — recent activity table */}
          <View style={styles.section} break>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>{c.sec4}</Text>
              <View>
                <Text style={styles.sectionEyebrow}>From your chart</Text>
                <Text style={styles.sectionTitle}>{c.sec4Title}</Text>
              </View>
            </View>
            <Text style={styles.proseMuted}>{c.activityRecent}</Text>
            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={[styles.tableHeadCell, { width: 90 }]}>
                  {c.cols.when}
                </Text>
                <Text style={[styles.tableHeadCell, { width: 110 }]}>
                  {c.cols.what}
                </Text>
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>
                  {c.cols.detail}
                </Text>
              </View>
              {c.rows.map((row, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text style={[styles.tableCell, { width: 90, color: COLORS.muted }]}>
                    {row.when}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: 110, fontFamily: "Helvetica-Bold", color: COLORS.navy },
                    ]}
                  >
                    {row.what}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {row.detail}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 5 — warnings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>{c.sec5}</Text>
              <View>
                <Text style={styles.sectionEyebrow}>Safety</Text>
                <Text style={styles.sectionTitle}>{c.sec5Title}</Text>
              </View>
            </View>
            <View style={styles.warning}>
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>{c.warningTitle}</Text>
                <Text style={styles.warningText}>{c.warningBody}</Text>
              </View>
            </View>
            <View
              style={[
                styles.warning,
                {
                  backgroundColor: COLORS.warningSoft,
                  borderLeftColor: COLORS.warning,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.warningTitle, { color: COLORS.warning }]}>
                  {c.callTitle}
                </Text>
                <Text style={styles.warningText}>{c.callBody}</Text>
              </View>
            </View>
          </View>

          {/* Section 6 — care team */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>{c.sec6}</Text>
              <View>
                <Text style={styles.sectionEyebrow}>Contact</Text>
                <Text style={styles.sectionTitle}>{c.sec6Title}</Text>
              </View>
            </View>
            <Text style={styles.prose}>{c.sec6Body}</Text>

            <View style={styles.signRow}>
              <View style={styles.signCol}>
                <View style={styles.signLine} />
                <Text style={styles.signLabel}>
                  {c.patient} · {patient.firstName} {patient.lastName}
                </Text>
              </View>
              <View style={styles.signCol}>
                <View style={styles.signLine} />
                <Text style={styles.signLabel}>
                  {c.careTeam} · {patient.surgeon}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.pageFooter} fixed>
          <Text>{c.notForEmergency}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              c.pageOf(pageNumber, totalPages)
            }
          />
        </View>
      </Page>
    </Document>
  );
}
