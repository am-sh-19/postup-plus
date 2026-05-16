"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";
import { copy, t } from "@/lib/copy";
import type { ChatMessage, Locale, Patient } from "@/lib/types";

interface ChatPaneProps {
  patient: Patient;
  locale: Locale;
  externalMessages: ChatMessage[];
}

function seedMessages(patient: Patient, locale: Locale): UIMessage[] {
  const detail =
    patient.procedureDetail ??
    (locale === "es"
      ? "reemplazo total de cadera"
      : "total hip replacement");

  const greeting =
    locale === "es"
      ? `Hola ${patient.firstName}. Estoy aquí para ayudarle con su recuperación tras su **${patient.procedure}** (${detail}).\n\n¿Cómo se siente la cadera hoy — en reposo y al caminar con el andador?`
      : `Hi ${patient.firstName}. I'm here to help with your recovery after your **${patient.procedure}** (${detail}).\n\nHow is your hip feeling today — at rest and when walking with your walker?`;

  return [
    {
      id: "seed-greeting",
      role: "assistant",
      parts: [{ type: "text", text: greeting }],
    },
  ];
}

function messageText(msg: UIMessage): string {
  return msg.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export function ChatPane({
  patient,
  locale,
  externalMessages,
}: ChatPaneProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const initial = useMemo(
    () => seedMessages(patient, locale),
    [patient, locale],
  );

  const { messages, setMessages, sendMessage, status, stop, error } = useChat({
    transport,
    messages: initial,
  });

  const [input, setInput] = useState("");
  const streamRef = useRef<HTMLDivElement>(null);
  const externalLenRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalMessages.length <= externalLenRef.current) return;
    const newOnes = externalMessages.slice(externalLenRef.current);
    externalLenRef.current = externalMessages.length;
    setMessages((prev) => [
      ...prev,
      ...newOnes.map<UIMessage>((m) => ({
        id: m.id,
        role: "system",
        parts: [{ type: "text", text: m.content }],
      })),
    ]);
  }, [externalMessages, setMessages]);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  function submit() {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    sendMessage(
      { text },
      { body: { patientId: patient.id, locale } },
    );
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <section className="flex-[0_0_60%] max-w-[60%] flex flex-col min-w-0 max-lg:flex-none max-lg:max-w-full max-lg:w-full">
      <div className="flex-1 flex flex-col card p-5 sm:p-6 min-h-0">
        <div className="mb-3 shrink-0 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight m-0">
              {t(copy.dashboard.chatTitle, locale)}
            </h1>
            <p className="text-postup-muted text-sm m-0 mt-1">
              {t(copy.dashboard.chatSubtitle, locale)}
            </p>
          </div>
          {isBusy && (
            <button
              type="button"
              onClick={() => stop()}
              className="shrink-0 text-xs font-semibold text-postup-muted hover:text-postup-blue px-3 py-1.5 rounded-full border border-[var(--postup-border)] bg-white"
            >
              {locale === "es" ? "Detener" : "Stop"}
            </button>
          )}
        </div>

        <div
          ref={streamRef}
          className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pr-1"
        >
          {messages.map((msg) => {
            const text = messageText(msg);

            if (msg.role === "system") {
              return (
                <div
                  key={msg.id}
                  className="self-center max-w-[92%] text-center bg-postup-bg-2 text-postup-muted text-[13px] px-4 py-2.5 rounded-xl border border-[var(--postup-border)]/60"
                >
                  <ChatMarkdown content={text} variant="system" />
                </div>
              );
            }

            if (msg.role === "user") {
              return (
                <div
                  key={msg.id}
                  className="self-end max-w-[82%] bg-postup-blue text-white px-4 py-3 rounded-[18px] rounded-br-sm text-[15px] leading-relaxed shadow-sm"
                >
                  <p className="m-0 whitespace-pre-wrap">{text}</p>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className="self-start max-w-[88%] bg-white border border-[var(--postup-border)] px-4 py-3 rounded-[18px] rounded-bl-sm shadow-sm"
              >
                <ChatMarkdown content={text} variant="assistant" />
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="self-start max-w-[88%] bg-white border border-[var(--postup-border)] px-4 py-3 rounded-[18px] rounded-bl-sm">
              <TypingDots />
            </div>
          )}

          {error && (
            <div className="self-center max-w-[92%] text-center bg-red-50 text-red-700 text-[13px] px-4 py-2.5 rounded-xl border border-red-100">
              {locale === "es"
                ? "No pude conectar. Intente de nuevo."
                : "Couldn't connect. Try again."}
            </div>
          )}
        </div>

        <div className="shrink-0 flex gap-2.5 mt-4 pt-3.5 border-t border-[var(--postup-border)]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={t(copy.dashboard.chatPlaceholder, locale)}
            className="flex-1 rounded-[var(--postup-radius)] border border-[#c5d4e8] px-4 py-3 text-[15px] focus:outline-2 focus:outline-postup-blue disabled:opacity-60 bg-white"
            disabled={isBusy}
            autoFocus
          />
          <button
            type="button"
            onClick={submit}
            disabled={isBusy || !input.trim()}
            className="btn-primary shrink-0 px-5 py-3"
          >
            {t(copy.dashboard.send, locale)}
          </button>
        </div>
      </div>
    </section>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center" aria-label="thinking">
      <span className="w-1.5 h-1.5 rounded-full bg-postup-muted/70 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-postup-muted/70 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-postup-muted/70 animate-bounce" />
    </span>
  );
}
