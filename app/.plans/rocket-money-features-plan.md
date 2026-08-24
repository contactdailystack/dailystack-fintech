# Rocket Money Features Implementation Plan

## เป้าหมาย
Implement 5 Rocket Money features บน DailyStack Home:

1. **Subscription Cancellation** — Cancel สมาชิกใน app (มีอยู่แล้ว → enhance)
2. **Bill Negotiation** — Concierge ช่วยต่อรองค่า bills (UI + logic ใหม่)
3. **Real-time Sync** — "Sync now" อัปเดตข้อมูลทันที (เพิ่มปุ่ม)
4. **Bill Timeline** — แสดง upcoming bills ล่วงหน้า (UI ใหม่)
5. **Split Bills** — แบ่งค่าใช้จ่ายกับคนอื่น (UI + logic ใหม่)

## Tasks

### Task 1: Subscription Cancellation Enhancement
- **ไฟล์:** `SubscriptionTrackerPage.tsx`
- **เพิ่ม:** Cancel button ที่ทำงานจริง, confirmation modal
- **Status:** มีอยู่แล้ว → ต้อง enhance

### Task 2: Bill Timeline UI
- **ไฟล์:** ใหม่ `BillTimeline.tsx` ใน design-system
- **UI:** Timeline แสดง upcoming bills, due date, amount
- **เชื่อม:** กดไป subscription detail

### Task 3: Sync Now Button
- **ไฟล์:** `DashboardPage.tsx`
- **เพิ่ม:** "Sync now" button หลัง ACCOUNTS header
- **Logic:** แสดง loading state, sync animation

### Task 4: Bill Negotiation Card
- **ไฟล์:** ใหม่ `BillNegotiationCard.tsx`
- **UI:** Card แสดง "Need help negotiating bills?" + CTA
- **เชื่อม:** ไปหน้า negotiation form

### Task 5: Split Bills Feature
- **ไฟล์:** ใหม่ `SplitBillsModal.tsx`
- **UI:** Modal แบ่งค่า, เลือก amount, send to friend
- **Logic:** คำนวณ split amount, notification

## Design System
- White background (#FFFFFF)
- Pill cards (rounded-3xl, shadow-sm)
- Accent: #C7FF2E
- Typography: Kanit (TH), Inter (EN)

## Deliverables
- Enhanced SubscriptionTrackerPage with cancel flow
- BillTimeline component
- Sync Now button on Dashboard
- BillNegotiationCard component
- SplitBillsModal component
- Build: ✅ 0 errors
