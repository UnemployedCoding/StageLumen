"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useForm } from '@formspree/react';

const FORMSPREE_ID = "mwlevbqd";

export default function ContactPage() {
  const { t } = useLanguage();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [state, handleSubmit] = useForm(FORMSPREE_ID);

  return (
    <div className="bg-slate-50 page-top-spacing pb-20 min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
            {t("contact.title")}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          {state.succeeded ? (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
              <p className="text-green-700 font-medium">{t("contact.success")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-primary mb-1.5">
                  {t("contact.name")}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-primary mb-1.5">
                  {t("contact.email")}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-primary mb-1.5">
                  {t("contact.message")}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                />
              </div>

              {state.errors && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                  <p className="text-red-600 text-sm font-medium">{t("contact.error")}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all text-base"
              >
                <Send className="h-4 w-4" />
                {state.submitting ? t("contact.sending") : t("contact.send")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
