"use client";

import React from "react";
import { Shield, Sparkles, Monitor, Cpu } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function WhitelabelPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Monitor className="h-6 w-6 text-accent" />,
      title: t("whitelabel.f1Title"),
      description: t("whitelabel.f1Desc"),
    },
    {
      icon: <Shield className="h-6 w-6 text-accent" />,
      title: t("whitelabel.f2Title"),
      description: t("whitelabel.f2Desc"),
    },
    {
      icon: <Cpu className="h-6 w-6 text-accent" />,
      title: t("whitelabel.f3Title"),
      description: t("whitelabel.f3Desc"),
    },
    {
      icon: <Sparkles className="h-6 w-6 text-accent" />,
      title: t("whitelabel.f4Title"),
      description: t("whitelabel.f4Desc"),
    },
  ];

  return (
    <div className="bg-slate-50 page-top-spacing pb-20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
            {t("whitelabel.title")}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t("whitelabel.subtitle")}
          </p>
          <div className="pt-4">
            <a
              href="mailto:contact@stagelumen.com?subject=StageLumen%20White%20Label%20Inquiry"
              className="inline-block rounded-full bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all text-base"
            >
              {t("whitelabel.cta")}
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feat, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 flex gap-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 flex-shrink-0">
                {feat.icon}
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
