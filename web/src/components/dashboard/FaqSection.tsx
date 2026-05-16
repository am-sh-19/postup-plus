"use client";

import { useState } from "react";
import { copy, t } from "@/lib/copy";
import { FAQ_ITEMS } from "@/lib/faq";
import type { Locale } from "@/lib/types";

export function FaqSection({ locale }: { locale: Locale }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  function openAt(index: number) {
    setOpenIndex(index);
    setModalOpen(true);
  }

  function toggleItem(index: number) {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }

  return (
    <>
      <nav>
        <button
          type="button"
          onClick={() => {
            setOpenIndex(0);
            setModalOpen(true);
          }}
          className="portal-card w-full flex items-center gap-3 p-4 text-left hover:border-postup-blue/40 transition-colors"
        >
          <span className="text-xl">❓</span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">
              {t(copy.dashboard.allFaqs, locale)}
            </span>
            <span className="block text-xs text-postup-muted">
              {t(copy.dashboard.faqDesc, locale)}
            </span>
          </span>
          <span className="text-postup-muted">›</span>
        </button>
      </nav>

      <div className="portal-card p-4">
        <h3 className="text-sm font-semibold m-0 mb-2">
          {t(copy.dashboard.quickAnswers, locale)}
        </h3>
        {FAQ_ITEMS.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            className="block w-full text-left text-sm py-2 border-b border-[var(--postup-border)] last:border-0 text-postup-navy hover:text-postup-blue"
          >
            {item.question[locale]}
          </button>
        ))}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-postup-navy/40"
          role="dialog"
          aria-modal
          onClick={() => setModalOpen(false)}
        >
          <div
            className="portal-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label={t(copy.dashboard.close, locale)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-postup-bg text-postup-muted text-xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold m-0">
              {t(copy.dashboard.faqModalTitle, locale)}
            </h2>
            <p className="text-postup-muted text-sm mb-4">
              {t(copy.dashboard.faqModalHint, locale)}
            </p>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="border-b border-[var(--postup-border)] py-4 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(i)}
                    className={`w-full flex justify-between gap-3 text-left font-semibold text-[15px] ${
                      openIndex === i ? "text-postup-blue" : ""
                    }`}
                  >
                    {item.question[locale]}
                    <span>{openIndex === i ? "−" : "+"}</span>
                  </button>
                  {openIndex === i && (
                    <p className="text-sm text-postup-muted mt-2 mb-0 leading-relaxed">
                      {item.answer[locale]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
