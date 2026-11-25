"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, ChevronDown, Sparkles } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const supabase = createClient();
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    const checkSubscription = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("subscriptions")
          .select("id, status")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();
        setIsSubscribed(!!data);
      } catch {
        setIsSubscribed(false);
      }
    };

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        await checkSubscription(data.user.id);
      } else {
        setUser(null);
        setIsSubscribed(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: unknown, session: { user?: { id: string; email?: string } | null } | null) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          await checkSubscription(session.user.id);
        } else {
          setUser(null);
          setIsSubscribed(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsSubscribed(false);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSeeDemo = () => {
    if (pathname === "/gallery") {
      window.location.reload();
    } else {
      router.push("/gallery");
    }
  };

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.gallery"), href: "/gallery" },
    { name: t("nav.pricing"), href: "/prices" },
    { name: t("nav.faq"), href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-4">
          
          {/* Left: Logo + Navigation Links */}
          <div className="flex items-center gap-5 lg:gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <LogoIcon size={32} />
              <span className="font-display text-xl font-bold tracking-tight text-primary whitespace-nowrap">
                Stage<span className="text-accent">Lumen</span>
              </span>
            </Link>

            {/* Navigation links (always visible on sm+) */}
            <nav className="hidden sm:flex items-center gap-4 lg:gap-7 shrink-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-accent whitespace-nowrap ${
                      isActive ? "text-accent font-semibold" : "text-slate-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions (Language, See Demo, Sign In, Subscribe, Dashboard, Sign Out) */}
          <div className="hidden sm:flex items-center gap-2.5 lg:gap-4 shrink-0">
            {/* Language Switcher */}
            <div className="relative shrink-0" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent transition-all whitespace-nowrap cursor-pointer"
                aria-label="Switch language"
              >
                {locale === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
                <ChevronDown className={`h-3 w-3 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-slate-100 bg-white shadow-lg py-1 z-50">
                  <button
                    onClick={() => { setLocale("en"); setLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      locale === "en" ? "text-accent bg-orange-50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { setLocale("fr"); setLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      locale === "fr" ? "text-accent bg-orange-50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                </div>
              )}
            </div>

            {user ? (
              isSubscribed ? (
                /* Logged In & Subscribed: Show eye-catching Dashboard + Sign Out */
                <>
                  <button
                    onClick={handleSeeDemo}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 text-accent hover:bg-orange-100 hover:border-orange-300 text-sm font-bold px-3.5 lg:px-4 py-2 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-accent" />
                    <span>{t("nav.seeDemo")}</span>
                  </button>

                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent via-orange-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <LayoutDashboard className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>{t("nav.dashboard")}</span>
                    <span className="flex h-2 w-2 rounded-full bg-white animate-pulse ml-0.5" />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="rounded-full border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-4 py-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              ) : (
                /* Logged In but NOT Subscribed: Show See Demo + Subscribe + Sign Out (No Dashboard) */
                <>
                  <button
                    onClick={handleSeeDemo}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 text-accent hover:bg-orange-100 hover:border-orange-300 text-sm font-bold px-3.5 lg:px-4 py-2 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-accent" />
                    <span>{t("nav.seeDemo")}</span>
                  </button>

                  <Link
                    href="/prices"
                    className="rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-bold px-4.5 lg:px-5.5 py-2.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                  >
                    {t("nav.subscribe")}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="rounded-full border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-4 py-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              )
            ) : (
              /* Guest (Not Logged In): Show See Demo + Sign In + Subscribe */
              <>
                {/* See Demo */}
                <button
                  onClick={handleSeeDemo}
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 text-accent hover:bg-orange-100 hover:border-orange-300 text-sm font-bold px-3.5 lg:px-4 py-2 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-accent" />
                  <span>{t("nav.seeDemo")}</span>
                </button>

                {/* Sign In */}
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-accent px-2.5 lg:px-3 py-2 transition-colors whitespace-nowrap shrink-0"
                >
                  {t("nav.signIn")}
                </Link>

                {/* Subscribe */}
                <Link
                  href="/prices"
                  className="rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 lg:px-5 py-2.5 shadow-lg shadow-orange-500/15 transition-all hover:shadow-orange-500/25 active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  {t("nav.subscribe")}
                </Link>
              </>
            )}
          </div>

          {/* Small Mobile Only trigger (< sm / 640px) */}
          <div className="flex sm:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => { setLocale(locale === "en" ? "fr" : "en"); }}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent transition-all cursor-pointer"
            >
              {locale === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Small Mobile Menu Drawer (< sm) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive ? "text-accent bg-orange-50 font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
            {user ? (
              isSubscribed ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-orange-500 text-white font-bold py-3 text-base shadow-md shadow-orange-500/20"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSeeDemo(); }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-base font-bold text-accent cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 fill-current animate-pulse text-accent" />
                    <span>{t("nav.seeDemo")}</span>
                  </button>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="flex justify-center rounded-xl border border-slate-200 py-2.5 text-base font-semibold text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/prices"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center rounded-xl bg-accent py-3 text-base font-bold text-white shadow-md shadow-orange-500/20 hover:bg-accent-hover transition-colors"
                  >
                    {t("nav.subscribe")}
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSeeDemo(); }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-base font-bold text-accent hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 fill-current animate-pulse text-accent" />
                    <span>{t("nav.seeDemo")}</span>
                  </button>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="flex justify-center rounded-xl border border-slate-200 py-2.5 text-base font-semibold text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              )
            ) : (
              <>
                <Link
                  href="/prices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-xl bg-accent py-3 text-base font-bold text-white shadow-md shadow-orange-500/20 hover:bg-accent-hover transition-colors"
                >
                  {t("nav.subscribe")}
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSeeDemo(); }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-base font-bold text-accent hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 fill-current animate-pulse text-accent" />
                  <span>{t("nav.seeDemo")}</span>
                </button>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-xl border border-slate-200 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
