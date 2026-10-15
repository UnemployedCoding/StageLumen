"use client";

import React from "react";
import { Terminal, Shield, Zap, Code } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ApiPage() {
  const { t } = useLanguage();

  const apis = [
    {
      icon: <Terminal className="h-6 w-6 text-accent" />,
      title: t("api.f1Title"),
      description: t("api.f1Desc"),
    },
    {
      icon: <Zap className="h-6 w-6 text-accent" />,
      title: t("api.f2Title"),
      description: t("api.f2Desc"),
    },
    {
      icon: <Code className="h-6 w-6 text-accent" />,
      title: t("api.f3Title"),
      description: t("api.f3Desc"),
    },
    {
      icon: <Shield className="h-6 w-6 text-accent" />,
      title: t("api.f4Title"),
      description: t("api.f4Desc"),
    },
  ];

  return (
    <div className="bg-slate-50 page-top-spacing pb-20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
            {t("api.title")}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t("api.subtitle")}
          </p>
          <div className="pt-4">
            <a
              href="mailto:api@stagelumen.com?subject=StageLumen%20API%20Access%20Request"
              className="inline-block rounded-full bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all text-base"
            >
              {t("api.cta")}
            </a>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {apis.map((api, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 flex gap-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 flex-shrink-0">
                {api.icon}
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary">{api.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{api.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* API Code Snippet example */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-primary text-center">{t("api.example")}</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 overflow-x-auto text-sm text-slate-300 font-mono shadow-xl">
            <pre>{`curl -X POST "https://api.stagelumen.com/v1/stage" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://yourbucket.com/photos/empty-living-room.jpg",
    "room_type": "living-room",
    "style": "scandinavian",
    "furniture_removal": false
  }'`}</pre>
          </div>
        </div>

      </div>
    </div>
  );
}
