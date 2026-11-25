import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const plan = searchParams.get("plan");

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && user) {
      // Check if user already has an active subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (subscription) {
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      // If a plan was selected during sign-up / login, redirect straight to Stripe Checkout!
      if (plan) {
        try {
          const session = await createCheckoutSession({
            userId: user.id,
            userEmail: user.email,
            plan,
            origin,
            supabase,
          });

          if (session.url) {
            return NextResponse.redirect(session.url);
          }
        } catch (checkoutErr) {
          console.error("Auth callback checkout redirect failed:", checkoutErr);
        }
      }

      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`${origin}/prices`);
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
