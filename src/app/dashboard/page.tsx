"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, Sparkles, History, CreditCard, LogOut,
  X, Download, ChevronDown, CheckCircle2
} from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import GalleryDragSlider from "@/components/GalleryDragSlider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ROOM_TYPES = [
  { id: "living_room", label: "Living Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "kitchen", label: "Kitchen" },
  { id: "dining_room", label: "Dining Room" },
  { id: "home_office", label: "Home Office" },
  { id: "outdoor", label: "Outdoor" },
];

const STYLES = [
  "Modern", "Scandinavian", "Luxury", "Midcentury",
  "Coastal", "Farmhouse", "Industrial",
];

type StagingState = "idle" | "loading" | "done" | "error";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  // Room Types and Styles
  const roomTypes = [
    { id: "living_room", label: t("room.livingRoom") },
    { id: "bedroom", label: t("room.bedroom") },
    { id: "kitchen", label: t("room.kitchen") },
    { id: "dining_room", label: t("room.diningRoom") },
    { id: "home_office", label: t("room.homeOffice") },
    { id: "outdoor", label: t("room.outdoor") },
  ];

  const styles = [
    { id: "Modern", label: t("style.modern") },
    { id: "Scandinavian", label: t("style.scandinavian") },
    { id: "Luxury", label: t("style.luxury") },
    { id: "Midcentury", label: t("style.midcentury") },
    { id: "Coastal", label: t("style.coastal") },
    { id: "Farmhouse", label: t("style.farmhouse") },
    { id: "Industrial", label: t("style.industrial") },
  ];

  // Nav
  const [activeTab, setActiveTab] = useState<"stage" | "history" | "billing">("stage");

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("living_room");
  const [style, setStyle] = useState("Modern");
  const [stagingState, setStagingState] = useState<StagingState>("idle");
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // History
  const [history, setHistory] = useState<{ id: string; before_url: string; after_url: string; room_type: string; style: string; created_at: string }[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Billing & Credits
  const [subscription, setSubscription] = useState<{ plan: string; billing: string; current_period_end: string } | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? null);
      const { data } = await supabase
        .from("profiles")
        .select("credits_remaining")
        .eq("id", user.id)
        .single();
      if (data) setCredits(data.credits_remaining);
    };
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStagingState("idle");
    setStagedUrl(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, []);

  const handleStage = async () => {
    if (!uploadedFile) return;
    setStagingState("loading");
    setElapsed(0);
    setErrorMsg("");

    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("room_type", roomType);
      formData.append("style", style.toLowerCase());

      const res = await fetch("/api/stage", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Staging failed");

      // Preload image before revealing
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = data.staged_image_url;
      });

      setStagedUrl(data.staged_image_url);
      setStagingState("done");
      setCredits((prev) => (prev && prev > 0 ? prev - 1 : 0));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStagingState("error");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const loadHistory = async () => {
    if (historyLoaded) return;
    const { data } = await supabase
      .from("stagings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);
    setHistory(data || []);
    setHistoryLoaded(true);
  };

  const loadBilling = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("subscriptions")
      .select("plan, billing, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    setSubscription(data);
  };

  const handleTabChange = (tab: "stage" | "history" | "billing") => {
    setActiveTab(tab);
    if (tab === "history") loadHistory();
    if (tab === "billing") loadBilling();
  };

  const handleManageBilling = async () => {
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-100 px-4 py-6 fixed h-full">
        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {[
            { id: "stage", label: t("dash.stageRoom"), icon: Sparkles },
            { id: "history", label: t("dash.myHistory"), icon: History },
            { id: "billing", label: t("dash.billing"), icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as "stage" | "history" | "billing")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors text-left ${
                activeTab === id
                  ? "bg-orange-50 text-accent"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {credits !== null && (
          <div className="mb-4 mx-2 px-3 py-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("dash.remainingCredits")}</span>
            <span className="text-2xl font-black text-slate-700">{credits}</span>
            {credits === 0 && (
              <Link href="/prices" className="mt-2 text-xs font-semibold text-accent hover:underline">
                {t("dash.upgradePlan")}
              </Link>
            )}
          </div>
        )}

        {/* User Info & Sign Out */}
        <div className="pt-4 mt-auto border-t border-slate-100 space-y-2">

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("dash.signOut")}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-64 page-top-spacing px-6 pb-6 lg:px-10 lg:pb-10">

        {activeTab === "stage" && (
          <div className="max-w-4xl space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-primary">{t("dash.stageRoom")}</h1>
              <p className="text-slate-500 text-sm mt-1">{t("dash.stageDesc")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload zone */}
              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 hover:border-accent bg-white transition-colors overflow-hidden aspect-video flex items-center justify-center"
                >
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Upload preview" fill className="object-cover" />
                  ) : (
                    <div className="text-center space-y-3 p-8">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-accent group-hover:bg-orange-100 transition-colors">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{t("dash.uploadPhoto")}</p>
                        <p className="text-xs text-slate-400 mt-1">{t("dash.dragDrop")}</p>
                        <p className="text-xs text-slate-300 mt-1">{t("dash.fileTypes")}</p>
                      </div>
                    </div>
                  )}
                  {previewUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setPreviewUrl(null); setStagedUrl(null); setStagingState("idle"); }}
                      className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>

                {/* Room type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("dash.roomType")}</label>
                  <div className="relative">
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-accent transition-colors pr-10"
                    >
                      {roomTypes.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("dash.interiorStyle")}</label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold border transition-colors ${
                          style === s.id
                            ? "bg-accent text-white border-accent"
                            : "bg-white text-slate-600 border-slate-200 hover:border-accent hover:text-accent"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStage}
                  suppressHydrationWarning
                  disabled={Boolean(!uploadedFile || stagingState === "loading")}
                  className="w-full rounded-xl bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white font-bold py-4 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                >
                  {stagingState === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {`${t("dash.staging")} (${elapsed}s) — ${t("dash.canTake45s")}`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("dash.stageNow")}
                    </>
                  )}
                </button>

                {errorMsg && <p className="text-sm text-red-500 font-medium">{errorMsg}</p>}
              </div>

              {/* Result */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("dash.result")}</label>
                {stagedUrl && previewUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-video">
                      <GalleryDragSlider beforeImage={previewUrl} afterImage={stagedUrl} />
                    </div>
                    <a
                      href={stagedUrl}
                      download="staged-room.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-accent text-accent font-semibold py-3 hover:bg-orange-50 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      {t("dash.downloadResult")}
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-white aspect-video flex items-center justify-center text-slate-300">
                    <div className="text-center space-y-2">
                      {stagingState === "loading" ? (
                        <>
                          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                          <p className="text-sm text-slate-400 font-medium">{t("dash.aiStaging")}</p>
                          <p className="text-xs text-slate-300">{t("dash.upTo45s")}</p>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mx-auto h-10 w-10 text-slate-200" />
                          <p className="text-sm font-medium">{t("dash.resultHere")}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="max-w-5xl space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-primary">{t("dash.myHistory")}</h1>
              <p className="text-slate-500 text-sm mt-1">{t("dash.historyDesc")}</p>
            </div>

            {!historyLoaded ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <History className="mx-auto h-12 w-12 text-slate-200" />
                <p className="text-slate-400 font-medium">{t("dash.noStagings")}</p>
                <button onClick={() => setActiveTab("stage")} className="text-accent font-semibold text-sm hover:underline">
                  {t("dash.stageFirst")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative aspect-video">
                      <Image src={item.after_url} alt="Staged room" fill className="object-cover" />
                    </div>
                    <div className="p-4 space-y-1">
                      <p className="text-sm font-semibold text-slate-700 capitalize">{item.room_type.replace("_", " ")} · {item.style}</p>
                      <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                      <a
                        href={`/api/download?url=${encodeURIComponent(item.after_url)}`}
                        download
                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("dash.download")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "billing" && (
          <div className="max-w-xl space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-primary">{t("dash.billing")}</h1>
              <p className="text-slate-500 text-sm mt-1">{t("dash.billingDesc")}</p>
            </div>

            {userEmail && (
              <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("dash.accountEmail")}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{userEmail}</p>
                </div>
              </div>
            )}

            {subscription ? (
              <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("dash.currentPlan")}</p>
                    <p className="text-xl font-extrabold text-primary capitalize mt-1">{subscription.plan}</p>
                  </div>
                  <span className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-bold text-green-700">{t("dash.active")}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>{t("dash.billingCycle")}</span>
                    <span className="font-semibold capitalize">{subscription.billing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("dash.nextRenewal")}</span>
                    <span className="font-semibold">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleManageBilling}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 text-sm transition-colors"
                >
                  {t("dash.manageBilling")}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm text-center space-y-4">
                <CreditCard className="mx-auto h-10 w-10 text-slate-200" />
                <p className="text-slate-400 font-medium">{t("dash.loadingBilling")}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
