"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ─── Constants ─────────────────────────────────────────────────────────────────

const STYLE_DURATION = 3000; // 3 s per style (matches reference)
const PAUSE_AFTER_CLICK = 10000; // 10 s pause after user interaction
const TICK = 50;

// ─── Data ──────────────────────────────────────────────────────────────────────

const ROOM_TABS = [
  { id: "living-room", translationKey: "room.livingRoom", defaultLabel: "Living Room" },
  { id: "bedroom", translationKey: "room.bedroom", defaultLabel: "Bedroom" },
  { id: "kitchen", translationKey: "room.kitchen", defaultLabel: "Kitchen" },
  { id: "home-office", translationKey: "room.homeOffice", defaultLabel: "Home Office" },
  { id: "dining-room", translationKey: "room.diningRoom", defaultLabel: "Dining Room" },
  { id: "outdoor", translationKey: "room.outdoor", defaultLabel: "Outdoor" },
];

const STYLE_KEYS = ["original", "modern", "scandinavian", "luxury", "midcentury", "coastal", "farmhouse"] as const;
type StyleKey = typeof STYLE_KEYS[number];

const STYLE_TRANSLATION_KEYS: Record<StyleKey, string> = {
  original: "style.original",
  modern: "style.modern",
  scandinavian: "style.scandinavian",
  luxury: "style.luxury",
  midcentury: "style.midcentury",
  coastal: "style.coastal",
  farmhouse: "style.farmhouse",
};

const ASSET_HASHES: Record<string, string> = {
  "bedroom-empty": "cd1cbaa3",
  "bedroom-modern": "716537fd",
  "bedroom-scandinavian": "a97964fa",
  "bedroom-midcentury": "e83bb0c5",
  "bedroom-luxury": "1e82d7ed",
  "bedroom-coastal": "9c00805f",
  "bedroom-farmhouse": "b560a658",
  "living-room-empty": "33d43674",
  "living-room-modern": "c831fe91",
  "living-room-scandinavian": "9495b32c",
  "living-room-midcentury": "96596aa7",
  "living-room-luxury": "ec21bc78",
  "living-room-coastal": "23757a09",
  "living-room-farmhouse": "ebf3b249",
  "kitchen-empty": "10abcb2a",
  "kitchen-modern": "059f756d",
  "kitchen-scandinavian": "0573aa31",
  "kitchen-midcentury": "26718de3",
  "kitchen-luxury": "292527e2",
  "kitchen-coastal": "8bbdbd89",
  "kitchen-farmhouse": "8788a857",
  "home-office-empty": "16f9d753",
  "home-office-modern": "30953252",
  "home-office-scandinavian": "ff6268b7",
  "home-office-midcentury": "1f60a9b5",
  "home-office-luxury": "dad8bea5",
  "home-office-coastal": "00c7ed28",
  "home-office-farmhouse": "599a72b9",
  "dining-room-empty": "933e30f9",
  "dining-room-modern": "605d88d7",
  "dining-room-scandinavian": "b55af28f",
  "dining-room-midcentury": "0fb0f1a4",
  "dining-room-luxury": "5d7a88ef",
  "dining-room-coastal": "4eef98ee",
  "dining-room-farmhouse": "935c1ba2",
  "outdoor-empty": "d1b88590",
  "outdoor-modern": "2731bda0",
  "outdoor-scandinavian": "98b14dcf",
  "outdoor-midcentury": "abf299ea",
  "outdoor-luxury": "d0409e92",
  "outdoor-coastal": "1a55c69a",
  "outdoor-farmhouse": "b662720d",
};

function imgPath(room: string, style: StyleKey) {
  const key = style === "original" ? `${room}-empty` : `${room}-${style}`;
  return `/demo/${key}.${ASSET_HASHES[key]}.webp`;
}

// Each "slide" = one room with its style images
const SLIDES = ROOM_TABS.map((room) => ({
  roomId: room.id,
  translationKey: room.translationKey,
  defaultLabel: room.defaultLabel,
  styles: (["original", "modern", "scandinavian", "luxury", "midcentury", "coastal", "farmhouse"] as StyleKey[]),
  originalSrc: imgPath(room.id, "original"),
  images: Object.fromEntries(
    (["modern", "scandinavian", "luxury", "midcentury", "coastal", "farmhouse"] as StyleKey[]).map((s) => [
      s,
      imgPath(room.id, s),
    ])
  ) as Record<string, string>,
}));

// ─── Style Pill Button ─────────────────────────────────────────────────────────

function StyleButton({
  label,
  isSelected,
  isPlaying,
  progress, // 0–100
  onClick,
}: {
  label: string;
  isSelected: boolean;
  isPlaying: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex overflow-hidden rounded-lg px-5 py-2 text-sm font-semibold capitalize",
        "backdrop-blur transition-colors duration-150",
        isSelected
          ? isPlaying
            ? "bg-accent/80 text-white"
            : "bg-accent text-white"
          : "bg-slate-800/70 text-white hover:bg-slate-700",
      ].join(" ")}
    >
      {label}
      {/* Progress fill */}
      {isSelected && isPlaying && (
        <span
          className="absolute left-0 top-0 z-[-1] h-full bg-white/25 transition-none"
          style={{ width: `${progress}%` }}
        />
      )}
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const { t } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);   // which room (thumbnail)
  const [styleIndex, setStyleIndex] = useState(0);   // which style
  const [progress, setProgress] = useState(0);       // 0–100
  const [isPlaying, setIsPlaying] = useState(true);

  const thumbsRef = useRef<HTMLDivElement>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = SLIDES[slideIndex];
  const styleKeys = slide.styles;
  const numStyles = styleKeys.length;

  // ── Auto-cycle style timer ──
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK / STYLE_DURATION) * 100;
        if (next >= 100) {
          setStyleIndex((s) => (s + 1) % numStyles);
          return 0;
        }
        return next;
      });
    }, TICK);

    return () => clearInterval(interval);
  }, [isPlaying, numStyles, slideIndex]);

  // ── Auto-cycle room timer (switches room after full style cycle) ──
  useEffect(() => {
    // Whenever styleIndex wraps to 0 while playing, advance to next room
    // (except on initial mount)
  }, [slideIndex]);

  // ── Resume playback after user interaction delay ──
  const resumeAfterDelay = useCallback(() => {
    setIsPlaying(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPlaying(true);
      setProgress(0);
    }, PAUSE_AFTER_CLICK);
  }, []);

  // ── Scroll active thumbnail into center view ──
  useEffect(() => {
    const el = thumbsRef.current?.children[slideIndex] as HTMLElement | undefined;
    if (el && thumbsRef.current) {
      const container = thumbsRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const scrollByAmount = elRect.left - containerRect.left - containerRect.width / 2 + elRect.width / 2;
      container.scrollBy({ left: scrollByAmount, behavior: "smooth" });
    }
  }, [slideIndex]);

  // ── Handlers ──
  const handleStyleClick = (idx: number) => {
    setStyleIndex(idx);
    setProgress(0);
    resumeAfterDelay();
  };

  const handleThumbClick = (idx: number) => {
    setSlideIndex(idx);
    setStyleIndex(0);
    setProgress(0);
    resumeAfterDelay();
  };

  const handleRoomTab = (idx: number) => {
    setSlideIndex(idx);
    setStyleIndex(0);
    setProgress(0);
    resumeAfterDelay();
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 page-top-spacing pb-14 lg:pb-20">

        {/* ── Heading ── */}
        <div className="text-center mb-10 space-y-3 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-accent border border-orange-200/60 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-current text-accent" />
            <span>{t("gallery.badge")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-primary">
            <span>{t("gallery.titlePrefix")}</span>{" "}
            <span className="sm:whitespace-nowrap">{t("gallery.titleSuffix")}</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t("gallery.subtitle")}
          </p>
        </div>

        {/* ── Room Tabs ── */}
        <div className="mb-5 overflow-hidden">
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {SLIDES.map((s, i) => (
              <button
                key={s.roomId}
                onClick={() => handleRoomTab(i)}
                className={[
                  "whitespace-nowrap rounded-xl border-2 px-3 py-2 text-sm font-semibold md:px-6 md:py-3 md:text-base transition-colors",
                  i === slideIndex
                    ? "border-accent bg-accent text-white shadow-md shadow-orange-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent",
                ].join(" ")}
              >
                {t(s.translationKey) || s.defaultLabel}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Image + Style Pills ── */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          {/* Base (original) image */}
          <Image
            src={slide.originalSrc}
            alt={`Empty ${t(slide.translationKey) || slide.defaultLabel}`}
            width={1080}
            height={720}
            sizes="(max-width: 1024px) 100vw, 1080px"
            priority
            className="w-full h-auto object-cover"
          />

          {/* Styled image overlay — hidden for 'original', visible for staged styles */}
          <div className="absolute inset-0">
            {styleKeys.map((styleKey, i) => {
              if (styleKey === "original") return null;
              return (
                <div
                  key={styleKey}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === styleIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={slide.images[styleKey]}
                    alt={`${t(slide.translationKey) || slide.defaultLabel} ${t(STYLE_TRANSLATION_KEYS[styleKey])}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1080px"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              );
            })}
          </div>

          {/* Room label badge (top-left) */}
          <div className="absolute left-2 top-2 md:left-4 md:top-4 z-10">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-800 shadow-lg">
              {t(slide.translationKey) || slide.defaultLabel}
            </span>
          </div>

          {/* Style pill buttons (bottom-right) */}
          <div className="absolute inset-x-2 bottom-2 md:inset-x-4 md:bottom-4 z-10">
            <div className="flex justify-end gap-2 flex-wrap">
              {styleKeys.map((styleKey, i) => (
                <StyleButton
                  key={styleKey}
                  label={t(STYLE_TRANSLATION_KEYS[styleKey])}
                  isSelected={i === styleIndex}
                  isPlaying={isPlaying}
                  progress={progress}
                  onClick={() => handleStyleClick(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Thumbnail Strip ── */}
        <div className="mt-4 overflow-hidden">
          <div ref={thumbsRef} className="-ml-4 flex overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {SLIDES.map((s, i) => {
              const isActive = i === slideIndex;
              return (
                <div
                  key={s.roomId}
                  onClick={() => handleThumbClick(i)}
                  className="relative ml-4 min-w-0 shrink-0 cursor-pointer transition-all duration-75"
                >
                  <div
                    className={[
                      "h-[72px] overflow-hidden rounded-xl border-2 my-2",
                      isActive
                        ? "border-accent shadow-[0_0_0_8px_rgba(249,115,22,0.15)]"
                        : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400",
                    ].join(" ")}
                  >
                    <Image
                      src={s.originalSrc}
                      alt={t(s.translationKey) || s.defaultLabel}
                      width={120}
                      height={72}
                      className="h-full w-full object-cover"
                      sizes="120px"
                    />
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
