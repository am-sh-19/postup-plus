"use client";

import { LogoHomeLink } from "@/components/brand/LogoHomeLink";
import { clearSession } from "@/lib/session";
import type { Locale } from "@/lib/types";

export const PROVIDER_NAV = [
  { id: "patients", label: "Patients", href: "/provider", icon: "Patients" },
  { id: "alerts", label: "Alerts", href: "/provider#alerts", icon: "Alerts" },
  {
    id: "messages",
    label: "Messages",
    href: "/provider#messages",
    icon: "Messages",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/provider#settings",
    icon: "Settings",
  },
] as const;

interface ProviderShellProps {
  locale: Locale;
  activeNav?: (typeof PROVIDER_NAV)[number]["id"];
  children: React.ReactNode;
}

export function ProviderShell({
  locale,
  activeNav = "patients",
  children,
}: ProviderShellProps) {
  function signOut() {
    clearSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex flex-col bg-sp-canvas text-sp-text">
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-sp-line bg-white">
        <div className="flex items-center gap-3">
          <LogoHomeLink height={32} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sp-teal-700 bg-sp-teal-50 border border-sp-teal-100 px-2 py-0.5 rounded">
            {locale === "es" ? "Proveedor" : "Provider"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-sp-muted">
          <span className="hidden sm:inline">
            {locale === "es" ? "Clínica Ortopédica PostUp+" : "PostUp+ Orthopedic Clinic"}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="text-sm font-medium text-sp-text border border-sp-line px-3 py-1.5 rounded-md hover:bg-sp-canvas bg-white"
          >
            {locale === "es" ? "Salir" : "Sign out"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav
          className="w-56 shrink-0 border-r border-sp-line bg-white p-3 hidden md:block"
          aria-label="Provider navigation"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sp-subtle px-2 mb-2">
            {locale === "es" ? "Navegación" : "Workspace"}
          </p>
          <ul className="space-y-0.5">
            {PROVIDER_NAV.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`relative block rounded-md px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-sp-teal-50 text-sp-teal-800 font-semibold"
                        : "text-sp-text hover:bg-sp-canvas"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-sp-teal-600"
                        aria-hidden
                      />
                    )}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
