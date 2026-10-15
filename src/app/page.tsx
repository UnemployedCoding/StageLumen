"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Check,
  X,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Clock,
  Coins,
  TrendingUp,
  Percent,
  Smile,
} from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Room & Style assets mapping
const ROOM_TYPES = [
  { id: "living-room", name: "Living Room" },
  { id: "bedroom", name: "Bedroom" },
  { id: "kitchen", name: "Kitchen" },
  { id: "dining-room", name: "Dining Room" },
  { id: "home-office", name: "Home Office" },
  { id: "outdoor", name: "Outdoor" },
];

const STYLES = [
  { id: "original", name: "Original" },
  { id: "modern", name: "Modern" },
  { id: "scandinavian", name: "Scandinavian" },
  { id: "luxury", name: "Luxury" },
  { id: "midcentury", name: "Midcentury" },
  { id: "coastal", name: "Coastal" },
  { id: "farmhouse", name: "Farmhouse" },
];

// Hash names from downloaded files
const ASSET_HASHES: Record<string, string> = {
  // Bedroom
  "bedroom-empty": "cd1cbaa3",
  "bedroom-modern": "716537fd",
  "bedroom-scandinavian": "a97964fa",
  "bedroom-midcentury": "e83bb0c5",
  "bedroom-luxury": "1e82d7ed",
  "bedroom-coastal": "9c00805f",
  "bedroom-farmhouse": "b560a658",
  // Living Room
  "living-room-empty": "33d43674",
  "living-room-modern": "c831fe91",
  "living-room-scandinavian": "9495b32c",
  "living-room-midcentury": "96596aa7",
  "living-room-luxury": "ec21bc78",
  "living-room-coastal": "23757a09",
  "living-room-farmhouse": "ebf3b249",
  // Kitchen
  "kitchen-empty": "10abcb2a",
  "kitchen-modern": "059f756d",
  "kitchen-scandinavian": "0573aa31",
  "kitchen-midcentury": "26718de3",
  "kitchen-luxury": "292527e2",
  "kitchen-coastal": "8bbdbd89",
  "kitchen-farmhouse": "8788a857",
  // Home Office
  "home-office-empty": "16f9d753",
  "home-office-modern": "30953252",
  "home-office-scandinavian": "ff6268b7",
  "home-office-midcentury": "1f60a9b5",
  "home-office-luxury": "dad8bea5",
  "home-office-coastal": "00c7ed28",
  "home-office-farmhouse": "599a72b9",
  // Dining Room
  "dining-room-empty": "933e30f9",
  "dining-room-modern": "605d88d7",
  "dining-room-scandinavian": "b55af28f",
  "dining-room-midcentury": "0fb0f1a4",
  "dining-room-luxury": "5d7a88ef",
  "dining-room-coastal": "4eef98ee",
  "dining-room-farmhouse": "935c1ba2",
  // Outdoor
  "outdoor-empty": "d1b88590",
  "outdoor-modern": "2731bda0",
  "outdoor-scandinavian": "98b14dcf",
  "outdoor-midcentury": "abf299ea",
  "outdoor-luxury": "d0409e92",
  "outdoor-coastal": "1a55c69a",
  "outdoor-farmhouse": "b662720d",
};

function getImagePath(room: string, style: string, isEmpty = false): string {
  const key = isEmpty || style === "original" ? `${room}-empty` : `${room}-${style}`;
  const hash = ASSET_HASHES[key];
  return `/demo/${key}.${hash}.webp`;
}

export default function Home() {
  const { t } = useLanguage();
  const [selectedRoom, setSelectedRoom] = useState("living-room");
  const [selectedStyle, setSelectedStyle] = useState("original");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const rooms = [
    { id: "living-room", name: t("room.livingRoom") },
    { id: "bedroom", name: t("room.bedroom") },
    { id: "kitchen", name: t("room.kitchen") },
    { id: "dining-room", name: t("room.diningRoom") },
    { id: "home-office", name: t("room.homeOffice") },
    { id: "outdoor", name: t("room.outdoor") },
  ];

  const styles = [
    { id: "original", name: t("style.original") },
    { id: "modern", name: t("style.modern") },
    { id: "scandinavian", name: t("style.scandinavian") },
    { id: "luxury", name: t("style.luxury") },
    { id: "midcentury", name: t("style.midcentury") },
    { id: "coastal", name: t("style.coastal") },
    { id: "farmhouse", name: t("style.farmhouse") },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* 1. Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-50 py-20 lg:py-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Headline text */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-accent border border-orange-100/50">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  {t("hero.badge")}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200/50">
                  {t("hero.australian")}
                </div>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-primary leading-[1.15]">
                {t("hero.title")}{" "}
                <span className="bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>
              <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  {t("hero.stat1")} <span className="font-bold text-primary">{t("hero.stat1Bold")}</span>{t("hero.stat1End")} <span className="font-bold text-primary whitespace-nowrap">{t("hero.stat1Cost")}</span>{"\u00A0"}{t("hero.stat1CostEnd")}
                </p>
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                  <span className="font-display italic text-accent">{t("hero.subtitleItalic")}</span>{" "}{t("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/gallery"
                  className="rounded-full bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 shadow-xl shadow-orange-500/20 transition-all hover:shadow-orange-500/30 flex items-center justify-center gap-2 group text-base"
                >
                  {t("hero.cta")}
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right: Interactive room demo carousel */}
            <div className="lg:col-span-7">
              <BeforeAfterSlider
                beforeImage={getImagePath(selectedRoom, selectedStyle, true)}
                afterImage={getImagePath(selectedRoom, selectedStyle)}
                aspectRatio="aspect-[4/3] sm:aspect-video"
                selectedRoom={selectedRoom}
                selectedStyle={selectedStyle}
                rooms={rooms}
                styles={styles}
                onRoomChange={setSelectedRoom}
                onStyleChange={setSelectedStyle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Bar Section */}
      <section className="w-full bg-white border-y border-slate-100 py-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-0 text-center md:divide-x divide-slate-100">
            
            {/* Stat 1 */}
            <div className="space-y-3 flex flex-col items-center md:px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-accent">
                <Clock className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-extrabold text-primary tracking-tight">
                  {t("stats.turnaroundVal")}
                </p>
                <p className="text-sm text-slate-500 font-medium">{t("stats.turnaround")}</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="space-y-3 flex flex-col items-center md:px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-accent">
                <Coins className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-extrabold text-primary tracking-tight">
                  {t("stats.costVal")}
                </p>
                <p className="text-sm text-slate-500 font-medium">{t("stats.cost")}</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="space-y-3 flex flex-col items-center md:px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-accent">
                <Sparkles className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-extrabold text-primary tracking-tight">
                  6<span className="text-accent">+</span>
                </p>
                <p className="text-sm text-slate-500 font-medium">{t("stats.styles")}</p>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="space-y-3 flex flex-col items-center md:px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-accent">
                <Percent className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-extrabold text-primary tracking-tight">
                  100<span className="text-accent">%</span>
                </p>
                <p className="text-sm text-slate-500 font-medium">{t("stats.realistic")}</p>
              </div>
            </div>

            {/* Stat 5 */}
            <div className="col-span-2 md:col-span-1 space-y-3 flex flex-col items-center md:px-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-accent">
                <Smile className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-extrabold text-primary tracking-tight">
                  100<span className="text-accent">+</span>
                </p>
                <p className="text-sm text-slate-500 font-medium">{t("stats.users")}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Agencies Section */}
      <section className="w-full bg-slate-50 border-y border-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("agencies.title")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 select-none">
            {/* Ray White style */}
            <span className="font-sans font-black text-2xl tracking-tighter text-slate-800">
              Ray White<span className="text-accent">.</span>
            </span>
            
            {/* McGrath style */}
            <span className="font-serif font-medium text-3xl tracking-wide text-slate-800">
              McGrath
            </span>
            
            {/* LJ Hooker style */}
            <span className="font-sans font-extrabold text-2xl italic tracking-tight text-slate-800">
              LJ Hooker
            </span>
            
            {/* Belle Property style */}
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="font-serif font-bold text-[1.6rem] lowercase tracking-wide text-slate-800">
                belle
              </span>
              <span className="font-sans font-bold text-[8px] tracking-[0.35em] text-slate-500 uppercase mt-1">
                property
              </span>
            </div>
            
            {/* Barry Plant style */}
            <span className="font-sans font-bold text-2xl tracking-tight text-slate-800">
              BarryPlant
            </span>
          </div>
        </div>
      </section>

      {/* 4. Features / Value Props Section */}
      <section className="w-full py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              {t("features.title")}
            </h2>
            <p className="text-slate-600 text-base">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-100 p-8 space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-accent">
                <TrendingUp className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-primary">{t("features.card1.title")}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("features.card1.desc")}
              </p>
            </div>
            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-100 p-8 space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-accent">
                <Clock className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-primary">{t("features.card2.title")}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("features.card2.desc")}
              </p>
            </div>
            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-100 p-8 space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-accent">
                <Coins className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-primary">{t("features.card3.title")}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("features.card3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="w-full bg-slate-50 py-20 lg:py-28 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              {t("howItWorks.title")}
            </h2>
            <p className="text-slate-600 text-base">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector lines (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-slate-200 -z-10" />

            {/* Step 1 */}
            <div className="space-y-4 flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-bold shadow-md shadow-orange-500/20">
                1
              </span>
              <h3 className="text-lg font-bold text-primary pt-2">{t("howItWorks.step1.title")}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {t("howItWorks.step1.desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-bold shadow-md shadow-orange-500/20">
                2
              </span>
              <h3 className="text-lg font-bold text-primary pt-2">{t("howItWorks.step2.title")}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {t("howItWorks.step2.desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-bold shadow-md shadow-orange-500/20">
                3
              </span>
              <h3 className="text-lg font-bold text-primary pt-2">{t("howItWorks.step3.title")}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {t("howItWorks.step3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Competitor Comparison Section */}
      <section className="w-full py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              {t("compare.title")}
            </h2>
            <p className="text-slate-600 text-base">
              {t("compare.subtitle")}
            </p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-100 shadow-xl">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-950 text-white font-bold text-sm">
                  <th className="px-6 py-4">{t("compare.feature")}</th>
                  <th className="px-6 py-4 bg-accent/90">StageLumen</th>
                  <th className="px-6 py-4 text-slate-400">{t("compare.traditional")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="px-6 py-4 font-semibold text-primary">{t("compare.costPerListing")}</td>
                  <td className="px-6 py-4 bg-accent/5 font-semibold text-accent">{t("compare.costUs")}</td>
                  <td className="px-6 py-4 text-slate-500">{t("compare.costThem")}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-primary">{t("compare.speed")}</td>
                  <td className="px-6 py-4 bg-accent/5 font-semibold text-accent">{t("compare.speedUs")}</td>
                  <td className="px-6 py-4 text-slate-500">{t("compare.speedThem")}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-primary">{t("compare.revisions")}</td>
                  <td className="px-6 py-4 bg-accent/5 font-semibold text-accent">{t("compare.revisionsUs")}</td>
                  <td className="px-6 py-4 text-slate-500">{t("compare.revisionsThem")}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-primary">{t("compare.furniture")}</td>
                  <td className="px-6 py-4 bg-accent/5 font-semibold text-accent">{t("compare.furnitureUs")}</td>
                  <td className="px-6 py-4 text-slate-500">{t("compare.furnitureThem")}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-primary">{t("compare.setup")}</td>
                  <td className="px-6 py-4 bg-accent/5 font-semibold text-accent">{t("compare.setupUs")}</td>
                  <td className="px-6 py-4 text-slate-500">{t("compare.setupThem")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section id="faq" className="w-full bg-slate-50 py-20 lg:py-28 border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              {t("faq.title")}
            </h2>
            <p className="text-slate-600 text-base">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
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
      </section>


      {/* 8. Final CTA Section */}
      <section className="w-full bg-primary py-24 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,101,0,0.15),transparent_60%)] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {t("cta.title")}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/prices"
              className="rounded-full bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-[0.98] text-base"
            >
              {t("nav.subscribe")}
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold px-8 py-4 transition-all text-base"
            >
              {t("hero.cta")}
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-slate-400 font-medium pt-4 border-t border-slate-900 max-w-xl mx-auto">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" />
              {t("cta.turnaround")}
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" />
              {t("cta.styles")}
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" />
              {t("cta.cancel")}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
