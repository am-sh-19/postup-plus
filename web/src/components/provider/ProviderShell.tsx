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
    <div className="min-h-screen flex flex-col bg-[var(--postup-bg)]">
      <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-[var(--postup-border)] bg-white">
        <div className="flex items-center gap-3">
          <LogoHomeLink height={34} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-postup-muted border border-[var(--postup-border)] px-2 py-0.5 rounded">
            {locale === "es" ? "Proveedor" : "Provider"}
          </span>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="text-sm font-medium text-postup-navy border border-[var(--postup-border)] px-3 py-1.5 rounded-[var(--postup-radius)] hover:bg-postup-bg bg-white"
        >
          {locale === "es" ? "Salir" : "Sign out"}
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav
          className="w-52 shrink-0 border-r border-[var(--postup-border)] bg-white p-2 hidden md:block"
          aria-label="Provider navigation"
        >
          <ul className="space-y-0.5">
            {PROVIDER_NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`block rounded-[var(--postup-radius)] px-3 py-2 text-sm ${
                    activeNav === item.id
                      ? "bg-postup-soft text-postup-navy font-semibold"
                      : "text-postup-muted hover:bg-postup-bg hover:text-postup-navy"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
