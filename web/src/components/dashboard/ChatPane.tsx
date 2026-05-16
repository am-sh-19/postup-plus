"use client";

import { useEffect, useRef, useState } from "react";
import { copy, t } from "@/lib/copy";
import type { ChatMessage, Locale, Patient } from "@/lib/types";

interface ChatPaneProps {
  patient: Patient;
  locale: Locale;
  externalMessages: ChatMessage[];
}

function seedMessages(patient: Patient, locale: Locale): ChatMessage[] {
  const hi =
    locale === "es"
      ? `Hola ${patient.firstName}, estoy aquí para ayudarle con su recuperación. ¿Cómo se siente hoy?`
      : `Hi ${patient.firstName}, I'm here to help with your recovery. How are you feeling today?`;

  const system =
    locale === "es"
      ? "Registre el dolor a la derecha (1–10). Percocet cada 6 horas con comida. Camine 5 min cada hora — toque + al moverse."
      : "Log pain on the right (1–10). Percocet every 6 hours with food. Walk 5 min every hour — tap + when you move.";

  return [
    { id: "1", role: "assistant", content: hi },
    {
      id: "2",
      role: "user",
      content:
        locale === "es"
          ? "Está hinchada y duele al levantarme"
          : "It's swollen and hurts when I stand up",
    },
    {
      id: "3",
      role: "assistant",
      content:
        locale === "es"
          ? `Es común en el día ${patient.dayPostOp} después de ${patient.procedure}. Hielo 20 minutos y mantenga la rodilla elevada.`
          : `That's common on day ${patient.dayPostOp} after ${patient.procedure}. Try ice for 20 minutes and keep the knee elevated.`,
      timestamp: "PostUp+ · 8:42 AM",
    },
    { id: "4", role: "system", content: system },
  ];
}

export function ChatPane({
  patient,
  locale,
  externalMessages,
}: ChatPaneProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    seedMessages(patient, locale),
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const externalLenRef = useRef(0);

  useEffect(() => {
    if (externalMessages.length > externalLenRef.current) {
      const newOnes = externalMessages.slice(externalLenRef.current);
      setMessages((prev) => [...prev, ...newOnes]);
      externalLenRef.current = externalMessages.length;
    }
  }, [externalMessages]);

  useEffect(() => {
    streamRef.current?.scrollTo({
      top: streamRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          patientId: patient.id,
          locale,
        }),
      });
      const data = (await res.json()) as { reply?: string };
      const reply =
        data.reply ??
        (locale === "es"
          ? "Gracias — anotado. Revise el panel derecho para dolor y medicamentos."
          : "Thanks — noted. Check the right panel for pain and medications.");

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          timestamp: "PostUp+ · just now",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            locale === "es"
              ? "No pude conectar. Intente de nuevo en un momento."
              : "Couldn't connect. Please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex-[0_0_60%] max-w-[60%] flex flex-col min-w-0 max-lg:flex-none max-lg:max-w-full max-lg:w-full">
      <div className="flex-1 flex flex-col bg-white rounded-[var(--postup-rounded)] p-5 sm:p-6 shadow-sm min-h-0 border border-[var(--postup-border)]/50">
        <div className="mb-3 shrink-0">
          <h1 className="text-xl font-semibold tracking-tight m-0">
            {t(copy.dashboard.chatTitle, locale)}
          </h1>
          <p className="text-postup-muted text-sm m-0 mt-1">
            {t(copy.dashboard.chatSubtitle, locale)}
          </p>
        </div>

        <div
          ref={streamRef}
          className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pr-1"
        >
          {messages.map((msg) => {
            if (msg.role === "system") {
              return (
                <div
                  key={msg.id}
                  className="self-center max-w-[92%] text-center bg-postup-bg-2 text-postup-muted text-[13px] px-4 py-2.5 rounded-xl"
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>",
                    ),
                  }}
                />
              );
            }
            if (msg.role === "user") {
              return (
                <div
                  key={msg.id}
                  className="self-end max-w-[82%] bg-postup-blue text-white px-4 py-3 rounded-[20px] rounded-br-md text-[15px] leading-relaxed"
                >
                  {msg.content}
                </div>
              );
            }
            return (
              <div
                key={msg.id}
                className="self-start max-w-[82%] bg-postup-soft px-4 py-3 rounded-[20px] rounded-bl-md text-[15px] leading-relaxed"
              >
                {msg.content}
                {msg.timestamp && (
                  <small className="block text-postup-muted text-[11px] mt-1.5">
                    {msg.timestamp}
                  </small>
                )}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 flex gap-2.5 mt-4 pt-3.5 border-t border-[var(--postup-border)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={t(copy.dashboard.chatPlaceholder, locale)}
            className="flex-1 rounded-full border border-[#c5d4e8] px-4 py-3.5 text-[15px] focus:outline-2 focus:outline-postup-blue"
            disabled={sending}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={sending}
            className="rounded-full bg-postup-blue text-white font-semibold px-6 py-3.5 disabled:opacity-60"
          >
            {t(copy.dashboard.send, locale)}
          </button>
        </div>
      </div>
    </section>
  );
}
