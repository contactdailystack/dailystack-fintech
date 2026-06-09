# DailyStack FinTech — Setup & Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** — [supabase.com](https://supabase.com)
3. **Vercel account** — [vercel.com](https://vercel.com) (free tier)

---

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it "DailyStack"
3. Choose a region (e.g., Southeast Asia — Singapore)
4. Save your **Project URL** and **anon/public key** from Settings → API

### 1.2 Run Database Migration
1. In Supabase Dashboard → SQL Editor
2. Copy-paste the entire content of `supabase/migrations/001_initial_schema.sql`
3. Run the query

This creates:
- `profiles` table (linked to auth.users)
- `monthly_records` table (income/expenses per month)
- `subscriptions` table (recurring subscriptions)
- Row Level Security (RLS) policies for data isolation
- Helper function: auto-create profile on signup

### 1.3 Enable Email Auth
1. Supabase Dashboard → Authentication → Providers
2. Ensure **Email** is enabled
3. (Optional) Configure SMTP for custom email templates

---

## Step 2: Local Development

```bash
cd app

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Then edit .env.local with your Supabase credentials

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

---

## Step 3: Build for Production

```bash
npm run build
npm run preview   # Preview production build
```

---

## Step 4: Deploy to Vercel

### Option A: Vercel CLI (recommended)
```bash
npm i -g vercel
cd app
vercel --prod
# Set environment variables when prompted:
# VITE_SUPABASE_URL = your-supabase-url
# VITE_SUPABASE_ANON_KEY = your-anon-key
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import `app/` directory
3. Set Build Command: `npm run build`
4. Set Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Deploy

---

## Step 5: Update Supabase Auth Settings

After deploying, add your Vercel domain to Supabase:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add your site URL (e.g., `https://your-app.vercel.app`)
3. Add redirect URL: `https://your-app.vercel.app/*`

---

## Environment Variables Reference

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API → anon key |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL) |
| Hosting | Vercel |

---

## Database Schema Overview

```
auth.users (managed by Supabase)
  └── profiles (id, email, full_name)
  └── monthly_records (user_id, month, year, income, expenses)
  └── subscriptions (user_id, name, cost, billing_cycle, category, next_billing_date, is_active)
```

All tables enforce RLS: users can only access their own data.
