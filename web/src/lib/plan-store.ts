"use client";

import type { PatientId, PlanItem } from "./types";

const STORAGE_PREFIX = "postup_plan";

function key(patientId: PatientId): string {
  return `${STORAGE_PREFIX}:${patientId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getPlan(patientId: PatientId): PlanItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = sessionStorage.getItem(key(patientId));
    if (!raw) return [];
    return JSON.parse(raw) as PlanItem[];
  } catch {
    return [];
  }
}

export function setPlan(patientId: PatientId, items: PlanItem[]): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(key(patientId), JSON.stringify(items));
}

export function addPlanItem(patientId: PatientId, item: PlanItem): PlanItem[] {
  const current = getPlan(patientId);
  const exists = current.some((p) => p.id === item.id);
  const next = exists ? current : [...current, item];
  setPlan(patientId, next);
  return next;
}

export function removePlanItem(patientId: PatientId, itemId: string): PlanItem[] {
  const next = getPlan(patientId).filter((p) => p.id !== itemId);
  setPlan(patientId, next);
  return next;
}

export function clearPlan(patientId: PatientId): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(key(patientId));
}
