"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, MailCheck } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const isSignUpParam = searchParams.get("signUp") === "true";
  const selectedPlan = searchParams.get("plan") || (searchParams.get("checkout") === "true" ? "pro" : "");
  const selectedBilling = searchParams.get("billing") || "";
  const isCheckoutFlow = searchParams.get("checkout") === "true" || !!selectedPlan;

  // If coming with a plan to buy, default to Sign Up
  const [isSignUp, setIsSignUp] = useState(isSignUpParam || (isCheckoutFlow && searchParams.get("signUp") !== "false"));
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (searchParams.has("signUp")) {
      setIsSignUp(searchParams.get("signUp") === "true");
    } else if (isCheckoutFlow) {
      setIsSignUp(true);
    }
  }, [searchParams, isCheckoutFlow]);

  const triggerCheckout = async (plan: string, userId?: string, userEmail?: string) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.toLowerCase(),
          userId: userId || undefined,
          email: userEmail || undefined,
        }),
      });
      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
        return true;
      }
    } catch (err) {
      console.error("Auto checkout error:", err);
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const callbackQuery = selectedPlan ? `?plan=${encodeURIComponent(selectedPlan)}` : "";
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback${callbackQuery}`
        : `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/callback${callbackQuery}`;

    if (isSignUp) {
      if (selectedPlan || isCheckoutFlow) {
        try {
          const res = await fetch("/api/auth/signup-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              password,
              plan: selectedPlan || "pro",
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            if (data.code === "USER_EXISTS") {
              // Existing user: sign them in and redirect to checkout
              const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
              if (!signInErr && signInData.user) {
                const redirected = await triggerCheckout(selectedPlan || "pro", signInData.user.id, email);
                if (redirected) return;
              } else {
                setError("An account with this email already exists. Please switch to Sign In.");
                setIsLoading(false);
                return;
              }
            } else {
              setError(data.error || "Failed to create account. Please try again.");
              setIsLoading(false);
              return;
            }
          }

          if (data.url) {
            // Pre-authenticate the client session in background so dashboard is ready after Stripe
            await supabase.auth.signInWithPassword({ email, password }).catch(() => {});
            window.location.href = data.url;
            return;
          }
        } catch (err: any) {
          console.error("Signup error:", err);
          setError(err.message || "Failed to initiate checkout. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // Regular sign up without checkout
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else if (data?.user) {
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage(t("login.checkEmail"));
          setIsLoading(false);
        }
      } else {
        setMessage(t("login.checkEmail"));
        setIsLoading(false);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else if (data.user) {
        if (selectedPlan) {
          const redirected = await triggerCheckout(selectedPlan, data.user.id, email);
          if (redirected) return;
        }

        const explicitRedirect = searchParams.get("redirect");
        if (explicitRedirect) {
          router.push(explicitRedirect);
          router.refresh();
          return;
        }

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id, status")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .maybeSingle();

        router.push(subscription ? "/dashboard" : "/prices");
        router.refresh();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    let callbackQuery = "";
    if (selectedPlan) {
      callbackQuery = `?plan=${encodeURIComponent(selectedPlan)}`;
    } else {
      const redirectParam = searchParams.get("redirect");
      if (redirectParam) callbackQuery = `?next=${encodeURIComponent(redirectParam)}`;
    }

    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback${callbackQuery}`
        : `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/callback${callbackQuery}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-start page-top-spacing pb-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">

          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("login.backToHome")}
          </button>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-extrabold text-primary tracking-tight">
              {isSignUp ? t("login.createAccount") : t("login.welcomeBack")}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isSignUp ? (
                <>
                  {t("login.alreadyHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(""); setMessage(""); }}
                    className="font-bold text-accent hover:text-accent-hover transition-colors cursor-pointer"
                  >
                    {t("login.signIn")}
                  </button>
                </>
              ) : (
                <>
                  {t("login.newToStageLumen")}{" "}
                  <Link
                    href="/prices"
                    className="font-bold text-accent hover:text-accent-hover transition-colors"
                  >
                    {t("nav.subscribe")}
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Selected Plan Callout */}
          {selectedPlan && (
            <div className="rounded-xl bg-orange-50/80 border border-orange-200/70 p-4 text-sm text-slate-800 flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0 animate-pulse" />
              <div>
                <span className="font-semibold">Subscribing to: </span>
                <span className="font-bold text-accent capitalize">{selectedPlan} Plan</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSignUp
                    ? "Create your account to proceed straight to Stripe payment."
                    : "Sign in to proceed straight to Stripe payment."}
                </p>
              </div>
            </div>
          )}

          {message ? (
            /* Dedicated Confirmation Card */
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-6 sm:p-7 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
                <MailCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t("login.checkEmailTitle")}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {message}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setMessage("");
                    setError("");
                  }}
                  className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white font-bold py-3.5 text-sm shadow-md shadow-orange-500/15 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {t("login.backToSignIn")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-[0.99]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                {t("login.continueWith")} {t("login.google")}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <span className="relative bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("login.orEmail")}
                </span>
              </div>

              {/* Email/Password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {t("login.fullName")}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder={t("login.namePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {t("login.email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder={t("login.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {t("login.password")}
                    </label>
                    {!isSignUp && (
                      <a href="#" className="text-xs font-semibold text-slate-400 hover:text-accent transition-colors">
                        {t("login.forgotPassword")}
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={t("login.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-11 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white font-bold py-3.5 text-sm shadow-lg shadow-orange-500/15 hover:shadow-orange-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span>
                      {selectedPlan
                        ? isSignUp
                          ? "Continue to Payment"
                          : "Sign In & Pay"
                        : isSignUp
                        ? t("login.signUp")
                        : t("login.signIn")}
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Visual panel */}
      <div className="hidden lg:flex relative flex-1 bg-slate-950 overflow-hidden">
        <Image
          src="/demo/living-room-scandinavian.9495b32c.webp"
          alt="Beautifully staged Scandinavian living room"
          fill
          priority
          className="object-cover opacity-60 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/20" />
        <div className="absolute bottom-16 left-16 right-16 space-y-6 text-white max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white border border-white/10">
            <LogoIcon size={16} />
            {t("login.joinPros")}
          </div>
          <blockquote className="space-y-2">
            <p className="text-2xl font-semibold leading-normal font-display">
              {t("login.testimonial")}
            </p>
            <footer className="text-sm font-medium text-slate-400">
              {t("login.testimonialAuthor")}
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
