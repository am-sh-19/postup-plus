"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginShell } from "@/components/auth/LoginShell";
import { authenticate, demoHintForRole } from "@/lib/auth-credentials";
import { copy, t } from "@/lib/copy";
import { setPatientSession, setProviderSession } from "@/lib/session";
import type { Locale, UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [role, setRole] = useState<UserRole>("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const account = authenticate(username, password, role);
    if (!account) {
      setError(t(copy.login.error, locale));
      return;
    }

    if (account.role === "patient" && account.patientId) {
      setPatientSession(account.patientId, locale, account.username);
      router.push("/loading-chart");
      return;
    }

    if (account.role === "provider" && account.providerId) {
      setProviderSession(account.providerId, locale, account.username);
      router.push("/provider");
    }
  }

  return (
    <LoginShell locale={locale} onLocaleChange={setLocale}>
      <h1 className="text-xl font-semibold text-postup-navy m-0 tracking-tight">
        {t(copy.login.title, locale)}
      </h1>
      <p className="text-postup-muted text-sm mt-1 mb-5">
        {t(copy.login.subtitle, locale)}
      </p>

      <div className="flex mb-5" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={role === "patient"}
          className={`role-tab ${role === "patient" ? "active" : ""}`}
          onClick={() => {
            setRole("patient");
            setError("");
          }}
        >
          {t(copy.roleGate.patient, locale)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "provider"}
          className={`role-tab ${role === "provider" ? "active" : ""}`}
          onClick={() => {
            setRole("provider");
            setError("");
          }}
        >
          {t(copy.roleGate.provider, locale)}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            {t(copy.login.username, locale)}
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="input-field"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            {t(copy.login.password, locale)}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input-field"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-[var(--postup-radius)] px-3 py-2 m-0">
            {error}
          </p>
        )}

        <p className="text-[11px] text-postup-muted leading-relaxed m-0">
          {demoHintForRole(role)}
        </p>

        <button type="submit" className="btn-primary">
          {t(copy.login.submit, locale)}
        </button>
      </form>
    </LoginShell>
  );
}
