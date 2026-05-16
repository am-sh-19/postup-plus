"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy, t } from "@/lib/copy";
import type {
  Locale,
  PatientId,
  PatientTranscript,
  TranscriptTurn,
} from "@/lib/types";

interface ChatTranscriptPaneProps {
  patientId: PatientId;
  locale: Locale;
  /** Optional ISO date strings to highlight (e.g., the timestamps of cited quotes). */
  highlightedTurnIds?: string[];
  className?: string;
}

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    sub: string;
    empty: string;
    loading: string;
    error: string;
    podLabel: string;
    you: string;
    coach: string;
    count: (n: number) => string;
  }
> = {
  en: {
    eyebrow: "Patient chat",
    title: "Conversation",
    sub: "Source of the insights on the left. Click a turn to focus.",
    empty: "No messages yet — chat will appear here once the patient writes in.",
    loading: "Loading transcript…",
    error: "Couldn't load the chat right now.",
    podLabel: "POD",
    you: "Emily",
    coach: "PostUp+",
    count: (n) => `${n} message${n === 1 ? "" : "s"}`,
  },
  es: {
    eyebrow: "Chat del paciente",
    title: "Conversación",
    sub: "La fuente de los insights de la izquierda. Toque un turno para enfocar.",
    empty: "Aún no hay mensajes — aparecerán aquí cuando el paciente escriba.",
    loading: "Cargando transcripción…",
    error: "No se pudo cargar el chat ahora.",
    podLabel: "POD",
    you: "Emily",
    coach: "PostUp+",
    count: (n) => `${n} mensaje${n === 1 ? "" : "s"}`,
  },
};

function formatClock(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleTimeString(
      locale === "es" ? "es-US" : "en-US",
      { hour: "numeric", minute: "2-digit" },
    );
  } catch {
    return "";
  }
}

function dayGroupLabel(pod: number | undefined, locale: Locale): string {
  if (pod === undefined) return "";
  return locale === "es" ? `Día post-op ${pod}` : `Post-op day ${pod}`;
}

interface GroupedDay {
  pod: number;
  label: string;
  turns: TranscriptTurn[];
}

function groupByPod(turns: TranscriptTurn[], locale: Locale): GroupedDay[] {
  const groups = new Map<number, TranscriptTurn[]>();
  for (const turn of turns) {
    const pod = turn.pod ?? 0;
    const arr = groups.get(pod) ?? [];
    arr.push(turn);
    groups.set(pod, arr);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([pod, arr]) => ({
      pod,
      label: dayGroupLabel(pod, locale),
      turns: arr,
    }));
}

export function ChatTranscriptPane({
  patientId,
  locale,
  highlightedTurnIds,
  className = "",
}: ChatTranscriptPaneProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [transcript, setTranscript] = useState<PatientTranscript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const c = COPY[locale];
  const streamRef = useRef<HTMLDivElement>(null);
  const highlighted = useMemo(
    () => new Set(highlightedTurnIds ?? []),
    [highlightedTurnIds],
  );

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    void (async () => {
      try {
        const res = await fetch(`/api/transcripts/${patientId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as PatientTranscript;
        if (cancelled) return;
        setTranscript(data);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Network error");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const groups = useMemo(
    () => (transcript ? groupByPod(transcript.turns, locale) : []),
    [transcript, locale],
  );

  useEffect(() => {
    // After the transcript loads, jump the scroll to the bottom so the most
    // recent turns are visible.
    if (status !== "ready") return;
    requestAnimationFrame(() => {
      const el = streamRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [status]);

  const total = transcript?.turns.length ?? 0;

  return (
    <section
      className={`bg-white rounded-lg border border-sp-line flex flex-col min-h-0 ${className}`}
      aria-label={c.title}
    >
      <header className="px-4 py-3 border-b border-sp-line-soft shrink-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-sp-subtle font-semibold m-0">
            {c.eyebrow}
          </p>
          {status === "ready" && total > 0 && (
            <p className="text-[10px] text-sp-muted m-0">{c.count(total)}</p>
          )}
        </div>
        <h3 className="text-[14px] font-semibold text-sp-ink m-0 mt-0.5 tracking-tight">
          {c.title}
        </h3>
        <p className="text-[11px] text-sp-muted m-0 mt-0.5 leading-snug">
          {c.sub}
        </p>
      </header>

      <div
        ref={streamRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4"
      >
        {status === "loading" && <Skeleton />}

        {status === "error" && (
          <div className="text-[12px] text-sp-danger">
            {c.error}
            {error && <p className="text-[10px] mt-1 m-0">{error}</p>}
          </div>
        )}

        {status === "ready" && total === 0 && (
          <p className="text-[12.5px] text-sp-muted italic m-0">{c.empty}</p>
        )}

        {status === "ready" &&
          groups.map((group) => (
            <div key={group.pod}>
              <div className="sticky top-0 z-[1] -mx-4 px-4 py-1 bg-white/95 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.12em] text-sp-subtle font-semibold m-0">
                  {group.label}
                </p>
              </div>
              <div className="space-y-2.5 mt-2">
                {group.turns.map((turn) => (
                  <TurnBubble
                    key={turn.id}
                    turn={turn}
                    locale={locale}
                    highlighted={highlighted.has(turn.id)}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function TurnBubble({
  turn,
  locale,
  highlighted,
}: {
  turn: TranscriptTurn;
  locale: Locale;
  highlighted: boolean;
}) {
  const isUser = turn.role === "user";
  const clock = formatClock(turn.timestamp, locale);

  return (
    <div
      id={`turn-${turn.id}`}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={[
          "max-w-[90%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed transition",
          isUser
            ? "bg-sp-teal-50 text-sp-ink border border-sp-teal-100 rounded-br-md"
            : "bg-sp-canvas text-sp-text border border-sp-line rounded-bl-md",
          highlighted ? "ring-2 ring-sp-teal-400" : "",
        ].join(" ")}
      >
        <RichText text={turn.content} />
      </div>
      <p
        className={`text-[10px] text-sp-subtle mt-1 ${isUser ? "mr-1" : "ml-1"}`}
      >
        {isUser
          ? locale === "es"
            ? "Paciente"
            : "Patient"
          : "PostUp+ · "}
        {!isUser && clock}
        {isUser && <> · {clock}</>}
      </p>
    </div>
  );
}

// Render light markdown (**bold**, simple bullet lines beginning with - or •)
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trimStart();
        const isBullet = /^([-•*])\s+/.test(trimmed);
        if (isBullet) {
          const body = trimmed.replace(/^([-•*])\s+/, "");
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span aria-hidden className="mt-1.5 inline-block w-1 h-1 rounded-full bg-sp-muted shrink-0" />
              <span>
                <BoldParts text={body} />
              </span>
            </div>
          );
        }
        return (
          <p key={i} className="m-0">
            <BoldParts text={line} />
          </p>
        );
      })}
    </>
  );
}

function BoldParts({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\*\*(.+)\*\*$/);
        if (m) return <strong key={i} className="font-semibold text-sp-ink">{m[1]}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`max-w-[80%] ${i % 2 === 0 ? "" : "ml-auto"} h-10 rounded-2xl bg-sp-line/40 animate-pulse`}
        />
      ))}
    </div>
  );
}
