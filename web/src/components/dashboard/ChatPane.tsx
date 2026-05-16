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
  className?: string;
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
  if (msg.parts?.length) {
    return msg.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");
  }
  const legacy = (msg as UIMessage & { content?: string }).content;
  return typeof legacy === "string" ? legacy : "";
}

export function ChatPane({
  patient,
  locale,
  externalMessages,
  className = "",
}: ChatPaneProps) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body, ...rest }) => ({
          ...rest,
          body: {
            ...body,
            messages: messages.filter(
              (m) => m.role === "user" || m.role === "assistant",
            ),
          },
        }),
      }),
    [],
  );

  const initial = useMemo(
    () => seedMessages(patient, locale),
    [patient, locale],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
    messages: initial,
  });

  const [input, setInput] = useState("");
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, externalMessages, status]);

  const isBusy = status === "submitted" || status === "streaming";
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const showTyping =
    status === "submitted" ||
    (status === "streaming" &&
      !messageText(
        lastAssistant ?? { id: "", role: "assistant", parts: [] },
      ));

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
    <section
      className={`flex flex-col h-full min-h-0 min-w-0 ${className}`.trim()}
      aria-label={t(copy.dashboard.chatTitle, locale)}
    >
      <div className="portal-card flex flex-col flex-1 min-h-0 h-full overflow-hidden p-5 sm:p-6">
        <div className="mb-3 shrink-0 flex items-start justify-between gap-3 border-b border-[var(--postup-border)]/50 pb-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight m-0 text-postup-navy">
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
              className="shrink-0 text-xs font-semibold text-postup-muted hover:text-postup-blue px-3 py-1.5 rounded-[var(--postup-radius)] border border-[var(--postup-border)] bg-white"
            >
              {locale === "es" ? "Detener" : "Stop"}
            </button>
          )}
        </div>

        <div
          ref={streamRef}
          className="scroll-region flex-1 flex flex-col gap-3 min-h-0 py-2 pr-1"
        >
          {messages.map((msg) => {
            const text = messageText(msg);
            if (!text && msg.role !== "user") return null;

            if (msg.role === "user") {
              return (
                <div
                  key={msg.id}
                  className="self-end max-w-[85%] bg-postup-blue text-white px-4 py-2.5 rounded-[var(--postup-radius)] rounded-br-sm text-[15px] leading-relaxed"
                >
                  <p className="m-0 whitespace-pre-wrap">{text}</p>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className="self-start max-w-[90%] bg-postup-soft border border-[var(--postup-border)]/40 px-4 py-2.5 rounded-[var(--postup-radius)] rounded-bl-sm"
              >
                <ChatMarkdown content={text} variant="assistant" />
              </div>
            );
          })}

          {externalMessages.map((msg) => (
            <div
              key={msg.id}
              className="w-full rounded-[var(--postup-radius)] border border-[var(--postup-border)] bg-postup-bg px-3 py-2.5"
              role="status"
            >
              <ChatMarkdown content={msg.content} variant="system" />
            </div>
          ))}

          {showTyping && (
            <div className="self-start max-w-[90%] bg-postup-soft border border-[var(--postup-border)]/40 px-4 py-2.5 rounded-[var(--postup-radius)] rounded-bl-sm">
              <TypingDots />
            </div>
          )}

          {error && (
            <div className="w-full text-center bg-red-50 text-red-700 text-[13px] px-4 py-2.5 rounded-[var(--postup-radius)] border border-red-100">
              {locale === "es"
                ? "No pude conectar. Intente de nuevo."
                : "Couldn't connect. Try again."}
            </div>
          )}
        </div>

        <div className="shrink-0 flex gap-2 mt-4 pt-3 border-t border-[var(--postup-border)]">
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
            className="input-field flex-1 min-w-0 py-2.5"
            disabled={isBusy}
            autoFocus
          />
          <button
            type="button"
            onClick={submit}
            disabled={isBusy || !input.trim()}
            className="btn-send"
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
