# Draft Day — Deployment Guide

Deploy your own public instance of Draft Day in ~20 minutes using Supabase + Vercel + GitHub.

---

## Prerequisites

- [GitHub account](https://github.com)
- [Supabase account](https://supabase.com) (free tier works)
- [Vercel account](https://vercel.com) (free tier works)
- Node.js 18+ installed locally (for running the dev server)

---

## Step 1 — Create the Supabase Project

1. Go to [supabase.com](https://supabase.com) and click **New Project**
2. Name it `draftday`, choose a region close to your users, set a strong database password
3. Wait ~2 minutes for provisioning

### Run the schema

4. In your Supabase dashboard, go to **SQL Editor**
5. Open `supabase/schema.sql` from this repo
6. Paste the entire contents and click **Run** — this creates all tables, functions, and RLS policies
7. Verify: go to **Table Editor** and confirm tables like `profiles`, `players`, `careers`, `battle_pass_tiers` exist

### Get your API keys

8. Go to **Project Settings → API**
9. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Step 2 — Push to GitHub

```bash
cd /path/to/draftday
git init
git add .
git commit -m "Initial commit: Draft Day football career simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/draftday.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Create the repo on GitHub first at [github.com/new](https://github.com/new).

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and click **Import Git Repository**
2. Select your `draftday` repo
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (update after first deploy) |

5. Click **Deploy** — Vercel builds and deploys automatically

> After your first deploy, go back to **Project Settings → Environment Variables** and update `NEXT_PUBLIC_SITE_URL` to your actual Vercel URL (e.g. `https://draftday.vercel.app`).

---

## Step 4 — Configure Supabase Auth

1. In Supabase, go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://draftday.vercel.app`)
3. Add to **Redirect URLs**:
   - `https://draftday.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

---

## Step 5 — Custom Domain (Optional)

### On Vercel:
1. Go to your project → **Settings → Domains**
2. Click **Add Domain** and enter your domain (e.g. `draftday.gg`)
3. Follow the DNS instructions (usually an A record or CNAME)

### On Supabase:
1. Go back to **Authentication → URL Configuration**
2. Update Site URL and Redirect URLs to use your custom domain

---

## Running Locally

```bash
# Copy and fill in env vars
cp .env.example .env.local
# Edit .env.local with your Supabase keys

# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:3000
```

---

## Pushing Updates

Any push to the `main` branch on GitHub automatically triggers a Vercel redeploy:

```bash
# Make your changes, then:
git add .
git commit -m "feat: add new feature"
git push
# Vercel deploys in ~60 seconds
```

---

## Database Migrations

For schema changes after initial deploy:

1. Write your SQL in a new file: `supabase/migrations/YYYYMMDD_description.sql`
2. Run it in Supabase SQL Editor
3. Commit the migration file to git for history

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your deployed URL for auth redirects |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase (PostgreSQL + Row Level Security)
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Styling**: Tailwind CSS
- **State**: Zustand (client), Server Components (server)
- **Animations**: Framer Motion

---

## Troubleshooting

**Auth not working?**
- Check that `NEXT_PUBLIC_SITE_URL` is set correctly
- Verify the redirect URL in Supabase matches your domain exactly

**Database errors on signup?**
- Make sure you ran the full `schema.sql` including the `handle_new_user` trigger
- Check Supabase logs: **Logs → Database**

**Build failing on Vercel?**
- Check Vercel build logs
- Verify all 4 environment variables are set in Vercel project settings

**Players not saving?**
- Check RLS policies in Supabase: **Authentication → Policies**
- The schema auto-enables RLS; ensure policies are created correctly

---

## License

MIT — build and ship your own version freely.
