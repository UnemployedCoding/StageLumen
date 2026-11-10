# StageLumen recovery

## Current backup coverage — 10 November 2026

The remote source is https://github.com/UnemployedCoding/StageLumen (public). It contains the application, public demo images, lockfile, email templates, and deployment/recovery files. Clone it on a replacement computer; the laptop is not required to recover that source.

**This is not yet a complete backup of the live service.** The Supabase connector can list the project but database queries fail with `password authentication failed`. No live SQL schema or customer-data dump was obtained, and no restore of customer data has been tested. The project is on the Free plan; managed daily backups are not included. The encrypted database backup script below is ready to use once database access is repaired. Confidential backups still need an off-device destination and a separately saved decryption identity.

| Component | Recovery source / status |
| --- | --- |
| Application and public images | GitHub, including complete committed Git history |
| Runtime versions | `package-lock.json`; Docker uses Node 22 |
| Server secrets | Existing Vercel project or password manager; deliberately excluded from public Git |
| Supabase database schema, policies, functions, customers | Still needs an encrypted SQL backup; do not infer schema from application code |
| Supabase Auth settings / Google OAuth / SMTP | Supabase dashboard and provider consoles; record configuration privately |
| Staging image bytes | Current history stores remote mnml URLs; SQL alone does not preserve the images |
| Storage buckets and object bytes | Must be inventoried/exported separately; not captured by SQL dumps |
| Stripe customers and subscriptions | Existing Stripe account; references are in Supabase. Hosting changes do not move Stripe accounts |
| Domain, DNS, account recovery / 2FA | Registrar/provider accounts; save access and recovery codes off-device |
| Cloudflare deployment | Templates and procedure below; requires adapter build and a Workers smoke test before DNS changes |

## Recover on a replacement computer

```sh
git clone https://github.com/UnemployedCoding/StageLumen.git
cd StageLumen
npm ci
cp .env.example .env.local
```

Use Node 22. Restore actual environment values privately from the existing Vercel `remi19 / stage-lumen` project's production settings or a password manager. `.env.local` is ignored by Git. `NEXT_PUBLIC_*` values must be correct **before building**, as they are embedded in browser JavaScript. Keep all server secrets free of the `NEXT_PUBLIC_` prefix.

```sh
npm run build
npm start
```

For laptop loss alone, keep using the existing Supabase and Stripe accounts: their data is already hosted remotely. A database restore is only needed if those hosted data are also lost or moved.

## Vercel

Import the GitHub repository in Vercel, choose Next.js, use the repository root, `npm ci`, and `npm run build`. Copy production variables from the existing project using `.env.example` as the inventory. Deploy, verify the generated deployment URL, then attach `www.stagelumen.com` and redirect the apex domain. The existing project already deploys pushes to `main` automatically.

Reusing the same production hostname avoids changing callback and webhook destinations. When using a different hostname, update `NEXT_PUBLIC_APP_URL`, Supabase Auth Site URL and allowed redirects, and the Stripe webhook URL (`/api/webhooks/stripe`). A new Stripe webhook endpoint has its own signing secret; update `STRIPE_WEBHOOK_SECRET` before testing it.

## VPS using Docker

Install Docker Engine with Compose on the VPS. Clone the repository and prepare the real production environment file:

```sh
cp .env.example .env.production.local
chmod 600 .env.production.local
# Fill real values privately, then:
docker compose up -d --build
docker compose logs --tail=100 web
curl -I http://127.0.0.1:3000
```

The build mounts the environment file as a BuildKit secret; it is excluded from the Docker context. Public variables are built into the client bundle, and the same env file supplies server variables at runtime. Rebuild when public variables change. Keep the built image private because it contains application code and build output.

The app listens only on loopback port 3000 on the VPS. Install Caddy on the host and use `deploy/Caddyfile` as its site configuration. Point domain DNS to the VPS, allow inbound TCP 80/443, validate the Caddy configuration, and reload it. Caddy supplies HTTPS and proxies to the application. The Compose file does not run Caddy itself. The Docker build has not been executed on the current laptop because Docker is unavailable; test it before migrating traffic.

For updates: pull the desired commit and run `docker compose up -d --build`. To roll back, select the earlier commit and rebuild. Keep the prior image until the replacement passes the checks below.

## Cloudflare Workers

This full-stack application needs Workers (or a VPS behind Cloudflare DNS/proxy); a static Pages upload cannot run authentication, billing, or staging API routes.

Cloudflare currently recommends vinext for new projects, which is a separate migration. The provided alternative uses the OpenNext adapter to preserve the existing Next.js application. Work in a separate clone/branch so its extra dependencies/configuration do not affect the Vercel recovery path:

```sh
git switch -c cloudflare-recovery
npm install --save-exact @opennextjs/cloudflare@1.20.16
npm install --save-dev --save-exact wrangler@4.159.0
cp deploy/cloudflare/wrangler.jsonc wrangler.jsonc
cp deploy/cloudflare/open-next.config.ts.template open-next.config.ts
npx opennextjs-cloudflare build
npx opennextjs-cloudflare preview
```

Restore environment variables privately before building. For Workers Builds, set the required build variables/secrets in Cloudflare as well as the runtime variables/secrets. Use Wrangler secrets for server keys, never plaintext checked-in `vars`. Set `NEXT_PUBLIC_APP_URL` to the intended hostname and rebuild. Log in with `npx wrangler login`, configure runtime variables/secrets, then use `npx opennextjs-cloudflare deploy`. Verify its generated hostname before assigning the production domain. The adapter dependencies, build, and deployed Workers behavior have not yet been validated for this application; this is a prepared migration path, not an already verified standby.

## Create a source snapshot

After committing all changes:

```sh
node scripts/backup-source.mjs
```

This creates a verified Git bundle, source tarball, SHA-256 checksums and a manifest inside ignored `backups/source-*`. Copy that folder to off-device storage. It excludes environment files and live database/storage content. The source is also downloadable from GitHub at any commit or recovery tag.

Recover a bundle on a new computer:

```sh
shasum -a 256 -c SHA256SUMS
git clone stagelumen.bundle StageLumen
cd StageLumen
git fsck --full
```

## Confidential database and settings backup

Install Docker, `age`, and Node/npm. Keep the database connection string and age private identity in a password manager accessible without the laptop. Use a direct or session-pooler database connection from Supabase's Connect dialog; percent-encode special characters in the connection password. `SUPABASE_SERVICE_ROLE_KEY` is an API credential, not the database password.

Set `SUPABASE_DB_URL` privately in your shell and set `BACKUP_AGE_RECIPIENT` to your age public recipient. Then run:

```sh
bash scripts/backup-database.sh
```

The script pins Supabase CLI v2.122.1 (v3 changed hosted/local defaults), exports roles/schema/data, encrypts each SQL stream, and writes `COMPLETE` only after all commands succeed. A partial directory without `COMPLETE` is not a completed backup. Transfer the encrypted directory to private off-device storage. Do not use shell tracing or put connection strings in committed files; the CLI receives its connection via a command argument on the trusted backup machine.

Alongside SQL, save an encrypted copy of the production environment, Auth redirect/provider/SMTP settings, Stripe webhook configuration, domain/DNS records, and the existing `supabase/email-templates/` configuration. Supabase SQL backups do not include Storage object bytes. Export any buckets separately. Download existing generated mnml images while their URLs still work, with an index from staging ID to filename; do not publish customer images to this public repository. The current app does not retain original uploaded files after a request, so those cannot be reconstructed from its history table.

Repeat data backups after material customer-data changes and periodically. No recurring backup job has been configured by this change. Keep at least one copy and the decryption identity off-device. Test recovery into a separate empty project before treating a backup as usable.

## Restore a database into a separate empty Supabase project

Do not run this against production or an existing populated project. Follow Supabase's current restore guide linked below and match extensions/Postgres versions (the existing project runs PostgreSQL 17). Decrypt the three files on a trusted machine:

```sh
age -d -i /secure/path/backup-identity.txt -o roles.sql roles.sql.age
age -d -i /secure/path/backup-identity.txt -o schema.sql schema.sql.age
age -d -i /secure/path/backup-identity.txt -o data.sql data.sql.age
psql "$RESTORE_DB_URL" --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql --file schema.sql \
  --command 'SET session_replication_role = replica' --file data.sql
```

Verify `auth.users`, `public.profiles`, `public.subscriptions`, `public.stagings`, row counts, RLS policies, triggers, and `decrement_credits` against the source. Reconfigure OAuth, SMTP, Auth redirects, API keys, Storage objects, and webhooks. Point the recovered app at the restored project and rebuild it. Record restore-test results privately; a script existing is not evidence that a data restore succeeded.

## Verify before changing DNS

Check homepage, gallery, pricing, static images, login/logout, dashboard access, and staging history. A signed-out `POST /api/stage` should return 401. With an authorized account, generate a room and confirm the image loads, history is saved, and one credit is deducted. Verify webhook signatures and subscription updates with an intentional test payment in Stripe test mode; do not send fabricated payment events into production. Check logs for server errors. Restore DNS only after the replacement is ready; keep the previous host until validation is complete.

## References

- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Cloudflare OpenNext adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [Cloudflare vinext migration](https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/nextjs/)
- [Supabase backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase CLI backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
