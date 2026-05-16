"use client";

import Image from "next/image";
import Link from "next/link";
import { clearSession } from "@/lib/session";
import type { Locale } from "@/lib/types";

/** Nav slots for parallel implementation — wire routes when ready */
export const PROVIDER_NAV = [
  { id: "patients", label: "Patients", href: "/provider", icon: "👥" },
  {
    id: "alerts",
    label: "Alerts",
    href: "/provider#alerts",
    icon: "🔔",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/provider#messages",
    icon: "💬",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/provider#settings",
    icon: "⚙️",
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
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[var(--postup-border)] bg-white">
        <div className="flex items-center gap-4">
          <Image
            src="/postup-logo.png"
            alt="PostUp+"
            width={120}
            height={36}
            className="h-9 w-auto"
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-postup-blue bg-postup-soft px-2.5 py-1 rounded-full">
            {locale === "es" ? "Portal proveedor" : "Provider portal"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-postup-muted hover:text-postup-navy"
          >
            {locale === "es" ? "Cambiar rol" : "Switch role"}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="text-sm font-medium text-postup-navy rounded-full border border-[var(--postup-border)] px-3 py-1.5 hover:bg-postup-bg"
          >
            {locale === "es" ? "Salir" : "Sign out"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav
          className="w-56 shrink-0 border-r border-[var(--postup-border)] bg-white p-3 hidden md:block"
          aria-label="Provider navigation"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-postup-muted px-2 mb-2">
            {locale === "es" ? "Navegación" : "Navigation"}
          </p>
          <ul className="space-y-1">
            {PROVIDER_NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    activeNav === item.id
                      ? "bg-postup-soft text-postup-blue font-semibold"
                      : "text-postup-navy hover:bg-postup-bg"
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
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
