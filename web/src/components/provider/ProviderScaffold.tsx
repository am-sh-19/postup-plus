import type { Locale } from "@/lib/types";

const SECTIONS = [
  {
    id: "patient-list",
    titleEn: "Patient list",
    titleEs: "Lista de pacientes",
    descEn:
      "Table or cards of active post-op patients. Start with demo patients Emily Person and Gabriela Martinez from @/lib/patients.",
    descEs:
      "Tabla o tarjetas de pacientes postoperatorios activos. Comience con Emily Person y Gabriela Martinez de @/lib/patients.",
    fileHint: "components/provider/PatientListPanel.tsx",
  },
  {
    id: "alerts",
    titleEn: "Pain & adherence alerts",
    titleEs: "Alertas de dolor y adherencia",
    descEn:
      "Surface high pain scores, missed Percocet doses, and low movement. Hook into patient check-in data when available.",
    descEs:
      "Muestre dolor alto, dosis omitidas de Percocet y poco movimiento. Conecte con datos de check-in cuando estén disponibles.",
    fileHint: "components/provider/AlertsPanel.tsx",
  },
  {
    id: "patient-detail",
    titleEn: "Patient detail drawer",
    titleEs: "Detalle del paciente",
    descEn:
      "Chart summary, pain trend, meds, last chat — drill-down from list row.",
    descEs:
      "Resumen, tendencia de dolor, medicamentos, último chat — al seleccionar un paciente.",
    fileHint: "components/provider/PatientDetailPanel.tsx",
  },
  {
    id: "messages",
    titleEn: "Care team messages",
    titleEs: "Mensajes del equipo",
    descEn: "Optional: async messages or escalations from the patient chatbot.",
    descEs: "Opcional: mensajes asíncronos o escalaciones del chatbot del paciente.",
    fileHint: "components/provider/MessagesPanel.tsx",
  },
] as const;

interface ProviderScaffoldProps {
  locale: Locale;
}

export function ProviderScaffold({ locale }: ProviderScaffoldProps) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-postup-navy m-0">
        {locale === "es" ? "Vista del proveedor" : "Provider view"}
      </h1>
      <p className="text-postup-muted mt-2 mb-6">
        {locale === "es"
          ? "Esta página es un andamiaje para desarrollo en paralelo. Reemplace cada sección con componentes reales."
          : "This page is scaffolding for parallel development. Replace each section with real components."}
      </p>

      <div className="rounded-xl border border-dashed border-postup-blue/40 bg-postup-soft/50 p-4 mb-8 text-sm text-postup-navy">
        <p className="font-semibold m-0 mb-1">
          {locale === "es" ? "Para quien implementa" : "For the implementer"}
        </p>
        <ul className="m-0 pl-4 space-y-1 text-postup-muted">
          <li>
            Shell: <code className="text-xs">components/provider/ProviderShell.tsx</code>
          </li>
          <li>
            Entry: <code className="text-xs">app/provider/page.tsx</code>
          </li>
          <li>
            Session: <code className="text-xs">getProviderSession()</code> from{" "}
            <code className="text-xs">@/lib/session</code>
          </li>
          <li>
            Handoff: <code className="text-xs">web/PROVIDER.md</code>
          </li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="rounded-2xl border border-[var(--postup-border)] bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-postup-navy m-0">
              {locale === "es" ? section.titleEs : section.titleEn}
            </h2>
            <p className="text-sm text-postup-muted mt-2 mb-3 leading-relaxed">
              {locale === "es" ? section.descEs : section.descEn}
            </p>
            <p className="text-[11px] font-mono text-postup-blue-dark bg-postup-bg rounded-lg px-2 py-1.5 m-0">
              → {section.fileHint}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
