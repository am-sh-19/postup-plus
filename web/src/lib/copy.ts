import type { Locale } from "./types";

export const copy = {
  roleGate: {
    title: { en: "Welcome to PostUp+", es: "Bienvenido a PostUp+" },
    subtitle: {
      en: "Choose how you're using the app today. No password required for this demo.",
      es: "Elija cómo usará la aplicación hoy. No se requiere contraseña en esta demo.",
    },
    patient: { en: "I'm a patient", es: "Soy paciente" },
    patientDesc: {
      en: "Recovery dashboard, pain check-ins, medications",
      es: "Panel de recuperación, dolor, medicamentos",
    },
    provider: { en: "I'm a provider", es: "Soy proveedor" },
    providerDesc: {
      en: "Clinic view — patient list, alerts, care team tools",
      es: "Vista clínica — lista de pacientes, alertas, herramientas",
    },
  },
  patientPick: {
    title: { en: "Choose a demo patient", es: "Elija un paciente demo" },
    subtitle: {
      en: "Skip sign-in — pick a chart to open the recovery dashboard.",
      es: "Sin inicio de sesión — elija un expediente para abrir el panel.",
    },
    continue: { en: "Open dashboard", es: "Abrir panel" },
    dayPostOp: { en: "Day", es: "Día" },
    postOp: { en: "post-op", es: "postoperatorio" },
  },
  login: {
    title: { en: "Patient sign-in", es: "Acceso del paciente" },
    subtitle: {
      en: "Enter your last name and clinic MRN to open your recovery dashboard.",
      es: "Ingrese su apellido y MRN de la clínica para abrir su panel de recuperación.",
    },
    lastName: { en: "Last name", es: "Apellido" },
    mrn: { en: "MRN (clinic password)", es: "MRN (contraseña de la clínica)" },
    submit: { en: "Continue", es: "Continuar" },
    hint: {
      en: "Demo: Person / MRN-48291 or Martinez / MRN-71903",
      es: "Demo: Person / MRN-48291 o Martinez / MRN-71903",
    },
    error: {
      en: "We couldn't find a chart with that name and MRN.",
      es: "No encontramos un expediente con ese nombre y MRN.",
    },
  },
  loading: {
    title: { en: "Loading your chart", es: "Cargando su expediente" },
    steps: {
      en: [
        "Verifying identity…",
        "Loading surgery history…",
        "Pulling prescriptions…",
        "Preparing your care plan…",
      ],
      es: [
        "Verificando identidad…",
        "Cargando historial quirúrgico…",
        "Obteniendo recetas…",
        "Preparando su plan de cuidado…",
      ],
    },
  },
  dashboard: {
    chatTitle: { en: "Talk to your care team", es: "Hable con su equipo de cuidado" },
    chatSubtitle: {
      en: "Ask about pain, medications, or recovery. Answers are tailored to your chart.",
      es: "Pregunte sobre dolor, medicamentos o recuperación. Las respuestas se adaptan a su expediente.",
    },
    chatPlaceholder: {
      en: "Ask a question about your recovery…",
      es: "Haga una pregunta sobre su recuperación…",
    },
    send: { en: "Send", es: "Enviar" },
    dayPostOp: { en: "Day", es: "Día" },
    postOp: { en: "post-op", es: "postoperatorio" },
    moveTitle: { en: "Move a little, often", es: "Muévase un poco, con frecuencia" },
    moveBody: {
      en: "Walk for 5 minutes every hour — short, frequent movement helps recovery and prevents stiffness.",
      es: "Camine 5 minutos cada hora — el movimiento corto y frecuente ayuda a la recuperación.",
    },
    nextWalk: { en: "Next walk due in", es: "Próxima caminata en" },
    walkNow: { en: "Time for a 5‑min walk now!", es: "¡Hora de caminar 5 min!" },
    logWalk: { en: "Log walk", es: "Registrar" },
    walkLogged: { en: "Walk logged — next in ~60 min", es: "Caminata registrada — próxima en ~60 min" },
    painTitle: { en: "How much pain right now?", es: "¿Cuánto dolor ahora?" },
    painHint: {
      en: "Tap a number or drag the slider — 1 is none, 10 is worst imaginable.",
      es: "Toque un número o arrastre — 1 es ninguno, 10 es lo peor imaginable.",
    },
    functionalToggle: {
      en: "＋ What can you do right now?",
      es: "＋ ¿Qué puede hacer ahora?",
    },
    functionalHide: {
      en: "− Hide functional check",
      es: "− Ocultar chequeo funcional",
    },
    functionalTitle: { en: "Functional check", es: "Chequeo funcional" },
    savePain: { en: "Save pain check-in", es: "Guardar dolor" },
    movementTitle: { en: "Today's movement", es: "Movimiento de hoy" },
    movementSub: {
      en: "5-min walks, often — tap + when you move",
      es: "Caminatas de 5 min — toque + al moverse",
    },
    walks: { en: "Walks", es: "Caminatas" },
    minTotal: { en: "min total · goal ~8 walks", es: "min total · meta ~8 caminatas" },
    medsTitle: { en: "Your medications", es: "Sus medicamentos" },
    takeWithFood: { en: "Take with food", es: "Tomar con comida" },
    takeWithFoodDesc: {
      en: "Always take each dose with a meal or snack to reduce nausea.",
      es: "Tome cada dosis con comida o un refrigerio para reducir náuseas.",
    },
    every6h: { en: "Every 6 hours", es: "Cada 6 horas" },
    every6hDesc: {
      en: "Do not take more often. Keep doses spaced apart.",
      es: "No tome con más frecuencia. Mantenga las dosis separadas.",
    },
    btnWithFood: { en: "I took it with food", es: "Lo tomé con comida" },
    btnWithFoodSub: {
      en: "Tap when you dose with a meal or snack",
      es: "Toque al tomar con comida",
    },
    btnDose: { en: "Mark dose taken", es: "Marcar dosis tomada" },
    btnDoseSub: {
      en: "Every 6 hours — logs your schedule",
      es: "Cada 6 horas — registra su horario",
    },
    nextDose: { en: "Next dose due in", es: "Próxima dosis en" },
    rememberFood: { en: "remember food", es: "recuerde comida" },
    allFaqs: { en: "All FAQs", es: "Todas las preguntas" },
    faqDesc: { en: "Common questions", es: "Preguntas frecuentes" },
    quickAnswers: { en: "Quick answers", es: "Respuestas rápidas" },
    faqModalTitle: { en: "Frequently asked questions", es: "Preguntas frecuentes" },
    faqModalHint: { en: "Tap a question to expand.", es: "Toque una pregunta para expandir." },
    close: { en: "Close", es: "Cerrar" },
    yes: { en: "Yes", es: "Sí" },
    help: { en: "Help", es: "Ayuda" },
    no: { en: "No", es: "No" },
    sliderMin: { en: "😄 No pain", es: "😄 Sin dolor" },
    sliderMax: { en: "😭 Worst", es: "😭 Peor" },
  },
} as const;

export function t<T extends Record<Locale, string>>(
  block: T,
  locale: Locale,
): string {
  return block[locale];
}
