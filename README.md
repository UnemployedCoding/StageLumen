# StageLumen

**StageLumen** is a state-of-the-art virtual staging SaaS web application designed for real estate agents and property managers. It transforms photos of empty rooms into fully furnished, listing-ready homes in under 45 seconds using advanced AI.

## Features
- **Instant Virtual Staging:** Upload empty room photos and get them staged instantly.
- **Multiple Design Styles:** Many interior design styles available (Modern, Scandinavian, Luxury, Coastal, Farmhouse, etc.).
- **Affordable Pricing:** Monthly subscriptions starting from $39/month (less than $1.30 per generated image).
- **Interactive Before & After Gallery:** Compare the original and staged versions of the rooms with an interactive drag slider.
- **Secure Payments:** Integrated with Stripe for fast and secure subscription management.
- **User Dashboard:** A seamless user portal to view staging history, manage billing, and stage new photos.

## Tech Stack
- **Frontend Framework:** [Next.js](https://nextjs.org) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4
- **Backend API:** Custom proxy route connected to the [mnml API](https://developers.mnml.ai/) at `api.mnml.ai` (using ArchDiffusion v4.4-Lite)
- **Database & Authentication:** [Supabase](https://supabase.com)
- **Payments:** [Stripe](https://stripe.com)

## Getting Started

For laptop loss, hosting recovery, Docker/VPS deployment, Cloudflare preparation, and database backups, start with [RECOVERY.md](RECOVERY.md).

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) project (for auth and database)
- A [Stripe](https://stripe.com) account (for billing)
- A [mnml API](https://developers.mnml.ai/console) key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your environment variables:
   ```env
   MNML_API_KEY="your_mnml_api_key"
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_pub_key"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
   STRIPE_PRICE_BASE_MONTHLY="your_price_id"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### mnml API migration

Staging creation and status polling use `https://api.mnml.ai`, keeping the existing `/v1` paths and parameters. The server accepts `MNML_API_KEY` or a comma-separated `MNML_API_KEYS` list; check the configured keys in the [developer console](https://developers.mnml.ai/console).

The [migration guide](https://developers.mnml.ai/docs/migrate) sets **1 March 2027** as the shutdown date for `/v1` on both hosts. Before then, migrate creation to `POST /v2/renders` and polling to `GET /v2/jobs/{id}`, adapting the request fields and response envelopes. The [v2 render reference](https://developers.mnml.ai/docs/renders) also documents expiring output URLs, so staging history will need durable image storage as part of that migration.
