"use client";

import React from "react";
import { Percent, DollarSign, Award, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AffiliatePage() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: <Percent className="h-6 w-6 text-accent" />,
      title: t("affiliate.b1Title"),
      description: t("affiliate.b1Desc"),
    },
    {
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      title: t("affiliate.b2Title"),
      description: t("affiliate.b2Desc"),
    },
    {
      icon: <Award className="h-6 w-6 text-accent" />,
      title: t("affiliate.b3Title"),
      description: t("affiliate.b3Desc"),
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: t("affiliate.b4Title"),
      description: t("affiliate.b4Desc"),
    },
  ];

  return (
    <div className="bg-slate-50 page-top-spacing pb-20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
            {t("affiliate.title")}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t("affiliate.subtitle")}
          </p>
          <div className="pt-4">
            <a
              href="mailto:affiliates@stagelumen.com?subject=StageLumen%20Affiliate%20Partner%20Application"
              className="inline-block rounded-full bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all text-base"
            >
              {t("affiliate.cta")}
            </a>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                {benefit.icon}
              </span>
              <h3 className="text-lg font-bold text-primary">{benefit.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Staging details */}
        <div className="bg-primary text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,101,0,0.1),transparent_50%)]" />
          <div className="max-w-2xl space-y-6 relative">
            <h2 className="font-display text-3xl font-bold tracking-tight">{t("affiliate.howTitle")}</h2>
            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>{t("affiliate.s1")}</p>
              <p>{t("affiliate.s2")}</p>
              <p>{t("affiliate.s3")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
