# DailyStack Full-Stack Architecture — MVP Launch
**Version:** 1.0
**Date:** June 12, 2026
**Status:** APPROVED FOR IMPLEMENTATION

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│              Vercel (Frontend CDN + Serverless)           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  React 18 + Vite + TypeScript + Tailwind CSS       │ │
│  │  SPA with React Router v6                           │ │
│  │  PWA-ready (service worker for push notifications)   │ │
│  └─────────────────────┬──────────────────────────────┘ │
│                        │ HTTPS / REST                    │
│                        ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Supabase (Backend-as-a-Service)                    │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────────────────┐    │ │
│  │  │  Auth        │  │  PostgreSQL               │    │ │
│  │  │  Email/Pwd   │  │  RLS-secured tables      │    │ │
│  │  │  JWT tokens  │  │  Full-text search        │    │ │
│  │  └──────────────┘  └──────────────────────────┘    │ │
│  │                                                      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  Edge Functions (Deno)                       │  │ │
│  │  │  ├── detect-ghost-subscriptions              │  │ │
│  │  │  ├── check-budget-alerts                     │  │ │
│  │  │  ├── user-insights (Money Twin)              │  │ │
│  │  │  ├── generate-weekly-story                   │  │ │
│  │  │  ├── analyze-spending                       │  │ │
│  │  │  └── stripe-webhook                         │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────────────────┐    │ │
│  │  │  Storage     │  │  Realtime                 │    │ │
│  │  │  Receipts    │  │  Push notifications      │    │ │
│  │  │  Exports     │  │  Live updates            │    │ │
│  │  └──────────────┘  └──────────────────────────┘    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React 18 + Vite + TypeScript | Fast HMR, excellent DX |
| Styling | Tailwind CSS + Design System | Mobile-first, consistent |
| State | React Context + Hooks | No Redux overhead for MVP |
| Routing | React Router v6 | Standard, well-supported |
| Auth | Supabase Auth | Built-in, RLS-secured |
| Database | Supabase PostgreSQL | Direct pg access, RLS |
| Backend | Supabase Edge Functions (Deno) | Serverless AI + Stripe |
| Hosting | Vercel | Free tier, instant deploys |
| Payments | Stripe | Subscription billing |
| Analytics | Vercel Analytics | Built-in performance |

---

## 3. Database Schema — Current State

**23 migrations already applied.** Key tables:

| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | User profiles | ✅ |
| `transactions` | All money movements | ✅ |
| `subscriptions` | Subscription tracking | ✅ |
| `budgets` | Monthly budget limits | ✅ |
| `budget_categories` | Category breakdown | ✅ |
| `money_twin` | AI twin data | ✅ |
| `user_subscriptions` | Stripe billing | ✅ |
| `emotional_context` | Transaction moods | ✅ |
| `alternative_assets` | Gold/Property/P2P/Crypto | ✅ |
| `fbis_meta` | Financial behavior signals | ✅ |

**NEW tables required for MVP:**

```sql
-- Budget alerts (budget guardian)
CREATE TABLE budget_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name   TEXT NOT NULL,
  alert_type      TEXT CHECK (alert_type IN ('warning','danger','milestone')),
  threshold_amount NUMERIC(12,2),
  current_spent   NUMERIC(12,2),
  message         TEXT,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Ghost subscription detections
CREATE TABLE ghost_subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_name    TEXT NOT NULL,
  estimated_cost   NUMERIC(10,2) NOT NULL,
  confidence_score FLOAT DEFAULT 0.5,
  status           TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled','dismissed')),
  billing_cycle    TEXT DEFAULT 'monthly',
  created_at       TIMESTAMPTZ DEFAULT now(),
  resolved_at      TIMESTAMPTZ
);
```

---

## 4. API Contracts — Edge Functions

### 4.1 `detect-ghost-subscriptions`
```
POST /functions/v1/detect-ghost-subscriptions

Auth: Required (Bearer JWT)
Input:
{
  "user_id": "uuid"
}

Output:
{
  "ghosts": [
    {
      "name": "Netflix",
      "estimated_cost": 299,
      "confidence": 0.87,
      "billing_cycle": "monthly",
      "suggestion": "You subscribed 6 months ago. Still using it?"
    }
  ]
}
```

### 4.2 `check-budget-alerts`
```
POST /functions/v1/check-budget-alerts

Auth: Required (Bearer JWT)
Input:
{
  "user_id": "uuid",
  "category": "Food & Dining",
  "spent": 4500,
  "limit": 5000
}

Output:
{
  "alert_level": "warning",  // "safe" | "warning" | "danger"
  "message": "งบอาหารใช้ไป 90% แล้ว เหลืออีก 500 บาท",
  "threshold_amount": 5000,
  "current_spent": 4500
}
```

### 4.3 `user-insights`
```
GET /functions/v1/user-insights?user_id=uuid

Auth: Required (Bearer JWT)

Output:
{
  "archetype_name": "balanced_saver",
  "traits": {
    "impulse_rating": 35,
    "future_orientation": 72,
    "value_seeking": 68,
    "social_resistance": 55
  },
  "overall_score": 57,
  "insights": [
    "คุณใช้จ่ายมากขึ้น 40% เมื่อเครียด",
    "คุณออมได้ดีกว่าเพื่อนในกลุ่ม 73%"
  ]
}
```

### 4.4 `generate-weekly-story`
```
POST /functions/v1/generate-weekly-story

Auth: Required (Bearer JWT)
Input:
{
  "user_id": "uuid",
  "week_start": "2026-06-01"
}

Output:
{
  "chapter_number": 24,
  "title": "สัปดาห์แห่งการเติบโต",
  "narrative": "สัปดาห์นี้คุณใช้จ่ายอย่างมีสติ... ",
  "stats": {
    "total_spent": 12500,
    "total_saved": 8000,
    "top_category": "อาหาร"
  }
}
```

### 4.5 `analyze-spending`
```
POST /functions/v1/analyze-spending

Auth: Required (Bearer JWT)
Input:
{
  "user_id": "uuid"
}

Output:
{
  "insights": [
    "ค่าอาหารสูงกว่าค่าเฉลี่ย 23%",
    "น่าจะประหยัดได้ 1,500 บาท/เดือน ถ้าลด dining out"
  ],
  "patterns": {
    "weekend_spending": 1.4,  // 40% more on weekends
    "impulse_spikes": 3       // 3 impulse buys this month
  },
  "recommendations": [
    "ลองทำอาหารที่บ้าน 2 มื้อ/สัปดาห์ → ประหยัด 1,200 บาท/เดือน",
    "Cancel 1 unused subscription → ประหยัด 300 บาท/เดือน"
  ]
}
```

---

## 5. Security Architecture

### 5.1 Authentication
- Supabase Auth with email/password
- JWT tokens with 1-hour expiry
- Refresh token rotation enabled
- No custom OTP — use Supabase built-in confirmation

### 5.2 Row Level Security (RLS)
All tables enforce: `user_id = auth.uid()`
Service role key NEVER exposed to frontend (Edge Functions only)

### 5.3 Edge Function Security
```typescript
// All Edge Functions must:
1. Verify Authorization header (Bearer token)
2. Extract user_id from verified JWT
3. Query ONLY that user's data
4. Validate all inputs with Zod
5. Return 401 for missing/invalid auth
6. Return 400 for invalid input
7. Return 500 for unexpected errors (log only, no leak)
```

### 5.4 Input Validation
All Edge Functions use Zod schemas:
```typescript
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const DetectGhostsSchema = z.object({
  user_id: z.string().uuid()
});
```

---

## 6. Environment Variables

```env
# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # Public — safe in frontend

# Backend/Edge Functions (.env.local — NEVER commit)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role — SERVER SIDE ONLY
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 7. Deployment Architecture

```
GitHub Main Branch
        │
        ▼
  GitHub Actions CI
  ├── TypeScript check
  ├── ESLint
  ├── npm build
  └── npm test
        │
        ▼ (if CI passes)
  Vercel Preview Deploy
  (auto for PRs)
        │
        ▼ (merge to main)
  Vercel Production Deploy
  └── Edge Functions deploy
```

---

*Architecture Owner: AI Solution Architect (Mavis)*
*Document Version: 1.0*
