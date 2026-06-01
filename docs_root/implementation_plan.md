# Overhaul Plan: Income & Expense Tracker (Money Mgr. & Rocket Money Clone)

This implementation plan outlines the steps to replace the Value tab with a fully-functional **Premium Income & Expense Tracker (จดบันทึกรายรับรายจ่าย)**. It copies the UX/UI of the popular **Money Mgr.** app (incorporating a built-in custom calculator, calendar ledger, and asset views) and the high-fidelity net worth/subscription tracking of **Rocket Money**, backed by real-time **Supabase PostgreSQL database sync**.

---

## User Review Required

> [!IMPORTANT]
> The Paywall flow is maintained to preserve marketing completeness. Initially, the feature displays a premium locked paywall with a shining padlock badge. Tap "Upgrade Pro" to simulate a checkout (complete with confettis) and permanently unlock the Money Mgr. ledger dashboard.

---

## Proposed Changes

### Component 1: Custom Calculator & Entry Overhaul in `LedgerAndOCR.tsx`

We will modify [LedgerAndOCR.tsx](file:///d:/Coding%2520Folder/dailystack/dailystack-frontend/src/app/wallet-sandbox/components/LedgerAndOCR.tsx) to:
1.  **Money Mgr. Entry Layout**: Render the transaction entry view featuring:
    *   Top category pills: **รายรับ (Income)**, **รายจ่าย (Expense)**, and **ยอดโอน (Transfer)**.
    *   Responsive inputs: Date, Amount (`มูลค่า`), Source/Destination Accounts, Notes (`เนื้อหา`).
2.  **Built-in Interactive Calculator Grid**: Build a fully-functional mathematical calculator keyboard at the bottom of the entry screen:
    *   Operators: `+`, `-`, `*`, `/`, `=`.
    *   Numeric buttons: `7 8 9`, `4 5 6`, `1 2 3`, `00 0 000`, and decimal `.`.
    *   Action triggers: backspace `⌫` and a large warm-red **Confirm (ยืนยัน)** button to save the transaction to PostgreSQL.
    *   Safely parses expressions (e.g. `200 + 450 - 50` computes `600` automatically inside the input).

#### [MODIFY] [LedgerAndOCR.tsx](file:///d:/Coding%20Folder/dailystack/dailystack-frontend/src/app/wallet-sandbox/components/LedgerAndOCR.tsx)

---

### Component 2: Grouped Assets & Net Worth in `WalletDashboard.tsx`

We will modify [WalletDashboard.tsx](file:///d:/Coding%2520Folder/dailystack/dailystack-frontend/src/app/wallet-sandbox/components/WalletDashboard.tsx) to:
1.  **Grouped Asset Classes**: Align accounts exactly like the Money Mgr. "ทรัพย์สิน" view:
    *   **Cash (เงินสด)**
    *   **Accounts (บัญชีธนาคาร)**
    *   **Card (บัตรเครดิต)**
    *   **Investments (ทอง/การลงทุน)**
2.  **Net Worth Indicator**: Render a clear summary displaying **Assets (ทรัพย์สิน)**, **Liabilities (หนี้สิน)**, and the **Total Net Worth (รวม)**.

#### [MODIFY] [WalletDashboard.tsx](file:///d:/Coding%20Folder/dailystack/dailystack-frontend/src/app/wallet-sandbox/components/WalletDashboard.tsx)

---

### Component 3: Locked Paywall Gates in `ValuePage.tsx`

We will modify [ValuePage.tsx](file:///d:/Coding%2520Folder/dailystack/dailystack-frontend/src/app/pages/ValuePage.tsx) to:
1.  **Premium Padlock Overlay**: Display a glowing cyber-neon lock icon on the virtual paywall screen to represent premium locked access.
2.  **Unlock Trigger**: Clicking the checkout button triggers a beautiful activation sequence with a simulated bank roundtrip and premium confettis.

#### [MODIFY] [ValuePage.tsx](file:///d:/Coding%20Folder/dailystack/dailystack-frontend/src/app/pages/ValuePage.tsx)

---

### Component 4: Unified Sandbox Sub-navigation in `WalletSandboxPlayground.tsx`

We will modify [WalletSandboxPlayground.tsx](file:///d:/Coding%2520Folder/dailystack/dailystack-frontend/src/app/wallet-sandbox/WalletSandboxPlayground.tsx) to:
1.  **Bilingual sub-navigation buttons**:
    *   `dashboard` -> **ทรัพย์สิน (Assets)**
    *   `ledger` -> **จดบันทึก (Ledger)**
    *   `budgets` -> **งบประมาณ (Budgets)**
    *   `calendar` -> **ปฏิทิน & สถิติ (Calendar & Stats)**
2.  **Money Mgr. Theme alignment**: Style sub-tabs with thin icons and muted highlights matching the Lark/Money Mgr. screenshots.

#### [MODIFY] [WalletSandboxPlayground.tsx](file:///d:/Coding%20Folder/dailystack/dailystack-frontend/src/app/wallet-sandbox/WalletSandboxPlayground.tsx)

---

## Verification Plan

### Automated Build Check
- Run `npm run build` to verify compiling integrity.

### Manual Verification
- Access `/value`: ensure the padlock and subscription paywall screen display properly.
- Unlock Pro: click the simulate paywall button, confirm the confettis display, and check that the ledger dashboard unlocks.
- Test Calculator Keyboard: input calculations (e.g. `20 + 35 * 2`), tap `=` to verify math evaluation, and click `ยืนยัน` to confirm the transaction is saved with real-time balance modifications.
