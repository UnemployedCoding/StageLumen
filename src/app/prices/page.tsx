"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, HelpCircle, ChevronDown, Flame, Sparkles, Eye, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasNoPlanNotice = searchParams.get("no_plan") === "true";
  const supabase = createClient();
  const { t } = useLanguage();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handlePlanClick = async (e: React.MouseEvent, planName: string) => {
    e.preventDefault();
    setLoadingPlan(planName);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/login?plan=${planName.toLowerCase()}&checkout=true`);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setLoadingPlan(null);
    }
  };

  // Pricing plans definition
  const plans = [
    {
      name: "Base",
      description: t("pricing.baseDesc"),
      credits: 25,
      monthlyPrice: 19,
      features: [
        "25 " + t("pricing.creditsPerMonth"),
        t("pricing.creditsReset"),
        t("pricing.noRollover"),
        t("pricing.allStyles"),
        t("pricing.hdDownloads"),
        t("pricing.emailSupport"),
      ],
      cta: "Get Base",
      popular: false,
    },
    {
      name: "Pro",
      description: t("pricing.proDesc"),
      credits: 75,
      monthlyPrice: 49,
      features: [
        "75 " + t("pricing.creditsPerMonth"),
        t("pricing.rollover60"),
        t("pricing.allStyles"),
        t("pricing.hdDownloads"),
        t("pricing.prioritySupport"),
      ],
      cta: "Get Pro",
      popular: true,
    },
    {
      name: "Business",
      description: t("pricing.businessDesc"),
      credits: 300,
      monthlyPrice: 149,
      features: [
        "300 " + t("pricing.creditsPerMonth"),
        t("pricing.rollover60"),
        t("pricing.allStyles"),
        t("pricing.hdDownloads"),
        t("pricing.prioritySupport"),
        t("pricing.bestValue"),
      ],
      cta: "Get Business",
      popular: false,
    },
  ];



  const pricingFaqs = [
    {
      q: t("pricing.faq.q1"),
      a: t("pricing.faq.a1"),
    },
    {
      q: t("pricing.faq.q2"),
      a: t("pricing.faq.a2"),
    },
    {
      q: t("pricing.faq.q3"),
      a: t("pricing.faq.a3"),
    },
    {
      q: t("pricing.faq.q4"),
      a: t("pricing.faq.a4"),
    },
  ];

  return (
    <div className="bg-slate-50 page-top-spacing pb-16 sm:pb-20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Notice if redirected from dashboard */}
        {hasNoPlanNotice && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-orange-50 border border-orange-200 text-center flex items-center justify-center gap-2.5 text-accent font-semibold text-sm animate-fade-in shadow-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-accent" />
            <span>{t("pricing.noPlanNotice")}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t("pricing.subtitle")}
          </p>

          {/* See demo button */}
          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-bold hover:border-accent hover:text-accent shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent transition-transform group-hover:scale-110" />
              <span>{t("pricing.seeDemo")}</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-accent transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = plan.monthlyPrice;
            const ratePerCredit = (price / plan.credits).toFixed(2);
            return (
              <div key={plan.name} className={`relative flex flex-col h-full ${plan.popular ? "md:-translate-y-2 z-10" : ""}`}>
                {plan.popular && (
                  <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                    <div className="absolute -inset-[50%] bg-[conic-gradient(from_0deg_at_50%_50%,#FF6500_0%,#fff0e5_50%,#FF6500_100%)] animate-[spin_6s_linear_infinite]" />
                  </div>
                )}
              <div
                className={`relative flex flex-col h-full flex-grow p-8 sm:p-10 bg-white transition-all duration-300 ${
                  plan.popular
                    ? "rounded-[calc(2rem-2px)] m-[2px] shadow-[0_20px_50px_-12px_rgba(249,115,22,0.25)]"
                    : "rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-1.5 text-[11px] font-black text-white uppercase tracking-widest shadow-sm">
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      {t("pricing.popular")}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-primary tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {plan.description}
                  </p>
                  <div className="pt-4 pb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold text-primary tracking-tight">${price}</span>
                      <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t("pricing.perMonth")}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-2">${ratePerCredit} {t("pricing.perCredit")}</p>
                  </div>
                  
                  <div className={`rounded-2xl p-5 mt-6 border ${plan.popular ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/80 border-slate-100'}`}>
                    <div className="flex justify-between items-center">
                       <span className={`text-3xl font-black ${plan.popular ? 'text-accent' : 'text-slate-800'}`}>{plan.credits}</span>
                       <span className={`text-sm font-bold ${plan.popular ? 'text-orange-900/60' : 'text-slate-500'}`}>{t("pricing.photosMonth")}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-8 pt-8 flex-grow">
                  <ul className="space-y-4 text-sm text-slate-600 font-medium">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-orange-100 text-accent' : 'bg-emerald-50 text-emerald-500'}`}>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => handlePlanClick(e, plan.name)}
                  disabled={loadingPlan === plan.name}
                  className={`mt-10 block w-full rounded-2xl py-4 text-center text-sm font-bold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-b from-accent to-[#ef6000] hover:to-accent text-white shadow-xl shadow-orange-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"
                  } ${loadingPlan === plan.name ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loadingPlan === plan.name ? t("pricing.processing") : t("pricing.subscribe")}
                </button>
              </div>
              </div>
            );
          })}
        </div>

        {/* Pricing FAQs Accordion */}
        <div className="max-w-3xl mx-auto pt-16 border-t border-slate-200 space-y-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-primary tracking-tight">
            {t("pricing.faqTitle")}
          </h2>
          <div className="space-y-4">
            {pricingFaqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-accent" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-40 border-t border-slate-100" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 py-5 text-sm text-slate-500 leading-relaxed bg-slate-50/20">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PricingContent />
    </Suspense>
  );
}
