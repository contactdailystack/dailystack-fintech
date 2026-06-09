# DailyStack FinTech MVP — Architecture & Roadmap

## 1. Project Overview

- **Project Name**: DailyStack
- **Type**: Personal Finance & Subscription Management Assistant
- **Business Objective**: Validate demand and acquire first paying users
- **Tech Stack**: React + TypeScript + Vite + Tailwind CSS + Supabase + Vercel

---

## 2. Architecture

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend Hosting)         │
│  ┌─────────────────────────────────────┐ │
│  │   React + Vite + TypeScript + Tailwind │
│  │   SPA (React Router v6)              │ │
│  └─────────────────────────────────────┘ │
│                    │                       │
│                    ▼                       │
│         Supabase (Backend-as-a-Service)    │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │  Supabase    │  │  Supabase        │   │
│  │  Auth        │  │  PostgreSQL      │   │
│  │  (email/    │  │  Database        │   │
│  │   password)  │  │                  │   │
│  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | React + Vite | Fast HMR, excellent TypeScript support |
| Styling | Tailwind CSS | Mobile-first, rapid iteration |
| Auth | Supabase Auth (email/password) | Built-in, RLS-secured, zero custom auth code |
| Database | Supabase PostgreSQL | Direct pg access, RLS for row-level security |
| Hosting | Vercel | Free tier, instant deploys, env var support |
| State | React Context + hooks | No Redux overhead needed for MVP |
| Routing | React Router v6 | Standard, well-supported |

---

## 3. Project Structure

```
app/                          # Vite React app
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client singleton
│   │   └── types.ts         # Shared TypeScript types
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/
│   │   │   ├── AuthGuard.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── IncomeExpense.tsx
│   │   │   └── MonthSelector.tsx
│   │   └── subscriptions/
│   │       ├── SubscriptionCard.tsx
│   │       ├── SubscriptionForm.tsx
│   │       ├── SubscriptionList.tsx
│   │       └── CostBreakdown.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SubscriptionsPage.tsx
│   │   └── InsightsPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMonthlyRecord.ts
│   │   └── useSubscriptions.ts
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   └── dateUtils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js

supabase/
├── migrations/
│   └── 001_initial_schema.sql
└── README.md
```

---

## 4. Database Schema

### Table: `profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY → auth.users.id |
| email | text | NOT NULL |
| full_name | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### Table: `monthly_records`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL → auth.users.id, RLS |
| month | date | NOT NULL (1st of month) |
| year | integer | NOT NULL |
| income | numeric(12,2) | DEFAULT 0 |
| expenses | numeric(12,2) | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Unique constraint**: (user_id, year, month)

### Table: `subscriptions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL → auth.users.id, RLS |
| name | text | NOT NULL |
| cost | numeric(10,2) | NOT NULL |
| billing_cycle | text | 'monthly' \| 'yearly' |
| category | text | DEFAULT 'other' |
| next_billing_date | date | |
| is_active | boolean | DEFAULT true |
| notes | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### Row Level Security (RLS)
- All tables: `user_id = auth.uid()` enforced via RLS policies
- SELECT, INSERT, UPDATE, DELETE: own data only

---

## 5. Page & Feature Map

| Page | Route | Features |
|------|-------|----------|
| Login | `/login` | Email/password login, link to signup |
| Signup | `/signup` | Email/password signup, auto-create profile |
| Dashboard | `/dashboard` | Income/Expense/Balance, month selector, edit inline |
| Subscriptions | `/subscriptions` | CRUD list, add/edit/delete modal, monthly/annual cost |
| Insights | `/insights` | Total spending, potential savings, cost warnings |

### Feature Details

**Dashboard**
- Shows current month by default
- Edit income and expenses inline (click to edit)
- Balance = Income - Expenses - Total Subscription Cost
- Month selector to view/edit past months

**Subscription Tracker**
- Add: name, cost, billing cycle (monthly/yearly), category, next billing date
- Edit: click card to open edit modal
- Delete: confirmation before delete
- Monthly cost = sum of all active monthly + (yearly/12)
- Annual cost = sum of all active monthly*12 + yearly

**Money Saving Insights**
- Total monthly subscription spending
- Potential savings if cheapest alternatives chosen
- Cost warnings: subscriptions due for renewal within 7 days
- Duplicate subscription detection

---

## 6. MVP Success Metrics

| Metric | Target |
|--------|--------|
| Signup completion rate | > 50% |
| Dashboard activation (add income) | > 60% within Day 1 |
| Subscription added within Day 3 | > 40% |
| DAU / MAU | > 25% |
| Time to first value | < 3 minutes |

---

## 7. Implementation Roadmap

### Sprint 1: Foundation (Day 1)
1. Project scaffold (Vite + React + TS + Tailwind)
2. Supabase setup + database migration
3. Auth (signup, login, logout)
4. AuthGuard + protected routes

### Sprint 2: Dashboard (Day 2)
5. Dashboard layout + month selector
6. Income/Expense input with save
7. Balance calculation display
8. Profile page (basic)

### Sprint 3: Subscriptions (Day 3)
9. Subscription list view
10. Add/Edit/Delete subscription modal
11. Cost calculation (monthly/annual)
12. Category badges

### Sprint 4: Insights & Polish (Day 4)
13. Insights page with total costs
14. Savings calculations
15. Cost warning notifications
16. Mobile responsive polish
17. Vercel deployment + env vars

---

## 8. Environment Variables

```env
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 9. Design System

- **Theme**: Pilo/Emerald Mint (#CCFF00 / #C7FF2E) — English-only UI
- **Mobile-first breakpoints**: sm(640), md(768), lg(1024)
- **Primary color**: Emerald green (#10B981)
- **Accent**: Pilo green (#CCFF00)
- **Background**: #F8FAFC (light), #0F172A (dark-ready)
- **Text**: #1E293B (primary), #64748B (secondary)
- **Error/Warning**: #EF4444 (red), #F59E0B (amber)
