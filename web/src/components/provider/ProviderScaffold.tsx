import { getPatients } from "@/lib/data";
import type { Locale } from "@/lib/types";

const SECTIONS = [
  {
    id: "patient-list",
    titleEn: "Patient list",
    titleEs: "Lista de pacientes",
    fileHint: "components/provider/PatientListPanel.tsx",
  },
  {
    id: "alerts",
    titleEn: "Pain & adherence alerts",
    titleEs: "Alertas de dolor y adherencia",
    fileHint: "components/provider/AlertsPanel.tsx",
  },
  {
    id: "patient-detail",
    titleEn: "Patient detail",
    titleEs: "Detalle del paciente",
    fileHint: "components/provider/PatientDetailPanel.tsx",
  },
] as const;

interface ProviderScaffoldProps {
  locale: Locale;
}

export function ProviderScaffold({ locale }: ProviderScaffoldProps) {
  const patients = getPatients();

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-postup-navy m-0 tracking-tight">
        {locale === "es" ? "Panel del proveedor" : "Provider dashboard"}
      </h1>
      <p className="text-postup-muted text-sm mt-1 mb-5">
        {locale === "es"
          ? "Datos compartidos desde clinic-data.json — reemplace las secciones siguientes."
          : "Shared data from clinic-data.json — replace the sections below."}
      </p>

      <section className="panel mb-6 overflow-hidden">
        <div className="px-4 py-2.5 bg-postup-bg border-b border-[var(--postup-border)]">
          <h2 className="text-sm font-semibold m-0 text-postup-navy">
            {locale === "es" ? "Pacientes activos" : "Active patients"}
          </h2>
        </div>
        <ul className="divide-y divide-[var(--postup-border)] m-0 p-0 list-none">
          {patients.map((p) => (
            <li
              key={p.id}
              className="px-4 py-3 flex justify-between gap-4 items-start bg-white"
            >
              <div>
                <p className="font-medium text-postup-navy m-0 text-sm">
                  {p.firstName} {p.lastName}
                </p>
                <p className="text-xs text-postup-muted m-0 mt-0.5">
                  {p.procedure} · Day {p.dayPostOp} · {p.mrn}
                </p>
              </div>
              <div className="text-right text-xs shrink-0">
                {p.alerts.length > 0 ? (
                  <span className="text-amber-700 font-medium">
                    {p.alerts.length}{" "}
                    {locale === "es" ? "alerta(s)" : "alert(s)"}
                  </span>
                ) : (
                  <span className="text-postup-green-dark font-medium">
                    {locale === "es" ? "Estable" : "Stable"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="panel p-4"
          >
            <h2 className="text-sm font-semibold text-postup-navy m-0">
              {locale === "es" ? section.titleEs : section.titleEn}
            </h2>
            <p className="text-[11px] font-mono text-postup-muted mt-3 mb-0">
              → {section.fileHint}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
