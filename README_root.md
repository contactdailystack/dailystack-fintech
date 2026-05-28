# DailyStack

> AI-Powered Lifestyle Discovery & Membership Platform

---

## 1. Project Overview

DailyStack คือแพลตฟอร์มที่ขับเคลื่อนด้วย AI เพื่อการค้นพบไลฟ์สไตล์และการเป็นสมาชิก ไม่ใช่แค่แอปหาคู่ทั่วไป แต่เป็นระบบนิเวศที่รวมหลายฟีเจอร์: **Dating, Events, Community, Marketplace, AI Assistant, Wallet** และ **Pet/Lifestyle** — ทั้งหมดอยู่ภายใต้การออกแบบที่สอดคล้องกัน

---

## 2. Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19.2.6 |
| Build Tool | Vite 8.0.12 |
| Language | TypeScript 6.0.2 |
| Styling | Tailwind CSS 3.4.17, PostCSS |
| Routing | react-router-dom 7.15.1 |
| Backend | Supabase (PostgreSQL + Auth) |
| i18n | i18next 26.2.0 |
| Icons | lucide-react 1.16.0 |
| PWA | vite-plugin-pwa 1.3.0 |
| Theme | next-themes 0.4.6 |

---

## 3. Project Architecture

```
src/
├── app/
│   ├── pages/          # Route pages (Auth, Dashboard, Memberships, Onboarding, Settings)
│   ├── screens/        # Screen components (auth/, profile/)
│   ├── providers/      # Context providers (ThemeProvider, LanguageContext)
│   ├── routes/         # AppRoutes (react-router configuration)
│   ├── services/       # Supabase client initialization
│   ├── i18n.ts         # i18next configuration
│   └── context/        # Additional contexts
├── styles/
│   ├── design-tokens.css   # Design tokens & color palettes
│   └── theme.css           # Tailwind directives & base styles
├── assets/             # Static assets (images)
├── utils/              # Utilities (analytics)
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### โฟลเดอร์หลัก

| โฟลเดอร์ | หน้าที่ |
|----------|---------|
| `pages/` | Route-level components หน้าหลักของแอป |
| `screens/` | คอมโพเนนต์ย่อยที่ประกอบเป็นหน้า Page |
| `providers/` | React Context สำหรับ Theme และ Language |
| `services/` | Supabase client และ API services |
| `styles/` | Design tokens, CSS variables, Tailwind config |

---

## 4. Design System Tokens

### โทนสีหลัก (Brand)

| Token | Hex | การใช้งาน |
|-------|-----|----------|
| `--brand-primary` | `#56BE89` | สีหลักของแบรนด์ (กรีน) |
| `--brand-primary-dark` | `#3A9E68` | Hover state |
| `--brand-ink` | `#1A1C1E` | สีข้อความหลัก |

### โทนสี Semantic

| Token | Hex | การใช้งาน |
|-------|-----|----------|
| `--semantic-bg` | `#F9FAFB` | Background หลัก |
| `--semantic-surface-1` | `#FFFFFF` | Card, Panel |
| `--semantic-surface-2` | `#FBFBFD` | Navigation, Secondary surface |
| `--semantic-muted` | `#9CA3AF` | ข้อความรอง |
| `--semantic-border` | `rgba(26,28,30,0.12)` | Border เส้นบาง |

### Feature Palettes

| Feature | Primary | Accent | Soft BG |
|---------|---------|--------|----------|
| Dating | `#FF6B81` | `#FF3B30` | `#FFF1EE` |
| Events | `#FFD24D` | `#FF7A00` | `#FFF9EE` |
| Community | `#5CC3FF` | `#00D1D1` | `#F3FBFF` |
| Marketplace | `#56BE89` | `#2F7A4B` | `#ECFBF3` |
| AI Assistant | `#8A4CFF` | `#00B3FF` | `#F1ECFB` |
| Wallet | `#D6453E` | `#B25422` | `#FBF5F1` |
| Pet | `#9FD8A8` | `#8B5A3C` | `#FBFDF8` |

### Shadow & Border System

```css
/* Sharp Shadow */
box-shadow: 4px 4px 0px var(--brand-ink);

/* Border-1.5 */
border: 1.5px solid var(--thick-border);
```

### Font

- **Primary Font:** Space Grotesk (400, 500, 600, 700)

### Dark Mode

```css
--semantic-bg: #0F1416
--semantic-surface-1: #0B0E0F
--semantic-surface-2: #111316
--semantic-text: #F1F3F4
```

---

## 5. Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Lint with ESLint
npm run lint

# Preview production build
npm run preview
```

---

## 6. Getting Started

### ติดตั้ง Dependencies

```bash
cd dailystack-frontend
npm install
```

### สร้าง Environment File

สร้างไฟล์ `.env` ที่ root ของ `dailystack-frontend/`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### รัน Development Server

```bash
npm run dev
```

เปิด browser ไปที่ `http://localhost:5173`

---

## 7. Features

- **Authentication** — ลงทะเบียนและยืนยันตัวตนผ่าน Supabase Auth
- **Multi-Feature Ecosystem** — ระบบสีแยกตามฟีเจอร์ (Dating, Events, Community, etc.)
- **Internationalization** — รองรับหลายภาษาด้วย i18next
- **Dark Mode** — ระบบธีมมืด/สว่าง
- **PWA Support** — สามารถติดตั้งบนอุปกรณ์ได้
- **Responsive Design** — รองรับทุกขนาดหน้าจอ

---

*DailyStack — Discover your lifestyle.*