"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { LoginShell } from "@/components/auth/LoginShell";
import { authenticate, demoHintForRole } from "@/lib/auth-credentials";
import { copy, t } from "@/lib/copy";
import { setPatientSession, setProviderSession } from "@/lib/session";
import type { Locale, UserRole } from "@/lib/types";

const DEMO_ACCOUNTS: Record<UserRole, { username: string; password: string }> = {
  patient: { username: "emily.person", password: "patient123" },
  provider: { username: "provider", password: "clinic123" },
};

const SHOW_LABEL: Record<Locale, { show: string; hide: string }> = {
  en: { show: "Show", hide: "Hide" },
  es: { show: "Ver", hide: "Ocultar" },
};

const SIGNING_IN: Record<Locale, string> = {
  en: "Signing in…",
  es: "Iniciando sesión…",
};

const USE_DEMO: Record<Locale, string> = {
  en: "Use demo account",
  es: "Usar cuenta de prueba",
};

export default function LoginPage() {
  const router = useRouter();
  const errorId = useId();
  const [locale, setLocale] = useState<Locale>("en");
  const [role, setRole] = useState<UserRole>("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function clearError() {
    if (error) setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const account = authenticate(username, password, role);
    if (!account) {
      setError(t(copy.login.error, locale));
      setSubmitting(false);
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
      return;
    }

    setSubmitting(false);
  }

  function applyDemo() {
    const demo = DEMO_ACCOUNTS[role];
    setUsername(demo.username);
    setPassword(demo.password);
    clearError();
  }

  return (
    <LoginShell locale={locale} onLocaleChange={setLocale}>
      <h2 className="text-[22px] font-semibold text-postup-navy m-0 tracking-tight">
        {t(copy.login.title, locale)}
      </h2>
      <p className="text-postup-muted text-[14px] mt-1.5 mb-6 leading-relaxed">
        {t(copy.login.subtitle, locale)}
      </p>

      <div
        className="role-pill mb-6"
        role="tablist"
        aria-label={locale === "es" ? "Tipo de cuenta" : "Account type"}
      >
        <span
          className="role-pill__thumb"
          data-role={role}
          aria-hidden="true"
        />
        <button
          type="button"
          role="tab"
          aria-selected={role === "patient"}
          className="role-pill__option"
          onClick={() => {
            setRole("patient");
            clearError();
          }}
        >
          {t(copy.roleGate.patient, locale)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "provider"}
          className="role-pill__option"
          onClick={() => {
            setRole("provider");
            clearError();
          }}
        >
          {t(copy.roleGate.provider, locale)}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label
            htmlFor="username"
            className="block text-[13px] font-semibold text-postup-navy/80 mb-1.5"
          >
            {t(copy.login.username, locale)}
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="login-input"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError();
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-postup-navy/80"
            >
              {t(copy.login.password, locale)}
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-[12px] font-medium text-postup-blue-dark hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-postup-blue rounded"
              aria-pressed={showPassword}
            >
              {showPassword
                ? SHOW_LABEL[locale].hide
                : SHOW_LABEL[locale].show}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="login-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </div>

        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className={`overflow-hidden transition-all duration-200 ${
            error ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {error && (
            <p className="text-[13px] text-[oklch(0.45_0.18_25)] bg-[oklch(0.97_0.04_25)] border border-[oklch(0.85_0.08_25)] rounded-xl px-3 py-2 flex items-start gap-2">
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                width="14"
                height="14"
                className="mt-0.5 shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm.75 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8 4a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 1.5 0v-4A.75.75 0 0 0 8 4Z"
                />
              </svg>
              <span>{error}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          className="login-submit mt-1 flex items-center justify-center gap-2"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="login-submit__spinner" aria-hidden />
              <span>{SIGNING_IN[locale]}</span>
            </>
          ) : (
            t(copy.login.submit, locale)
          )}
        </button>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={applyDemo}
            className="demo-chip focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-postup-blue"
            title={demoHintForRole(role)}
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              width="12"
              height="12"
              className="text-[oklch(0.55_0.06_240)]"
            >
              <path
                fill="currentColor"
                d="M8 1.5 9.85 6 14.5 6.4l-3.55 3.1 1.1 4.5L8 11.6l-4.05 2.4 1.1-4.5L1.5 6.4 6.15 6 8 1.5Z"
              />
            </svg>
            {USE_DEMO[locale]}
          </button>
          <span className="text-[11px] text-postup-muted/80">
            {role === "patient" ? "emily.person" : "provider"}
          </span>
        </div>
      </form>
    </LoginShell>
  );
}
