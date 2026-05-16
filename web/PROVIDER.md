# Provider portal — parallel build handoff

The patient app is live under `/dashboard`. The **provider portal** is scaffolded so another developer can build without touching patient routes.

## Routes

| Path | Purpose |
|------|---------|
| `/login` | Role gate: Patient vs Provider (no auth) |
| `/login/patient` | Pick demo patient → `/loading-chart` → `/dashboard` |
| `/provider` | Provider shell + placeholder sections |

## Session

Provider sessions use `sessionStorage` via `@/lib/session`:

```ts
import { getProviderSession, setProviderSession, clearSession } from "@/lib/session";

setProviderSession("en"); // set on role select
const session = getProviderSession(); // { role: "provider", locale: "en" }
```

Patient sessions are separate: `{ role: "patient", patientId, locale }`.

## Files to own

| File | Responsibility |
|------|----------------|
| `src/components/provider/ProviderShell.tsx` | Layout, sidebar nav, header |
| `src/components/provider/ProviderScaffold.tsx` | Replace with real dashboard |
| `src/components/provider/PatientListPanel.tsx` | **Create** — patient roster |
| `src/components/provider/AlertsPanel.tsx` | **Create** — pain/med/movement alerts |
| `src/components/provider/PatientDetailPanel.tsx` | **Create** — drill-down |
| `src/app/provider/page.tsx` | Compose panels, auth guard |

## Demo data

Reuse `@/lib/patients` (`PATIENTS.emily`, `PATIENTS.gabriela`) for list rows until a real API exists.

## Suggested build order

1. `PatientListPanel` — static list from `PATIENTS`
2. `PatientDetailPanel` — slide-over with procedure, day post-op, meds
3. `AlertsPanel` — mock flags (e.g. pain ≥ 7, missed dose)
4. Wire nav in `ProviderShell` to sub-routes if needed (`/provider/alerts`, etc.)

## Do not change (without coordination)

- `src/app/dashboard/**` — patient experience
- `src/lib/session.ts` — extend types if needed, keep discriminated `role`
