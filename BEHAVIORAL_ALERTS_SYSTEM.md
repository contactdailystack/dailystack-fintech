# Behavioral Alerts System
## DailyStack FinTech — Technical Documentation

---

## Overview

The **Behavioral Alerts System** is an intelligent notification framework that monitors user financial behavior patterns and delivers contextual, actionable alerts. It integrates with DailyStack's existing transaction data, risk scoring, and habit tracking to surface insights at the right moment.

### Key Features

- **8 Alert Categories**: Impulse, Budget, Habit, Savings, Emotional, Pattern, Milestone, Security
- **4 Severity Levels**: Info, Warning, Alert, Critical
- **Multi-channel Delivery**: In-app, Push, Email, SMS
- **Configurable Thresholds**: Per-rule warning/alert/critical thresholds
- **Smart Notifications**: Quiet hours, adaptive timing, rate limiting
- **User Preferences**: Granular control over categories, channels, and timing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  AlertsPage.tsx        │  AlertComponents.tsx                   │
│  - Full alert feed     │  - AlertCard, AlertBadge, Toast        │
│  - Search & filters    │  - AlertSummary, AlertSettingsPanel     │
│  - View modes          │                                        │
├────────────────────────┴────────────────────────────────────────┤
│                      AlertsContext.tsx                           │
│  - React Context for global state                               │
│  - Provider component                                             │
│  - Hooks: useAlerts, useActiveAlerts, etc.                       │
├─────────────────────────────────────────────────────────────────┤
│                       SERVICES                                   │
├──────────────┬──────────────┬─────────────────┬─────────────────┤
│ alertEngine  │ alertService │ alertNotifica-  │  fbisService    │
│ .ts          │ .ts          │ tions.ts        │  (existing)     │
├──────────────┴──────────────┴─────────────────┴─────────────────┤
│                     alertTypes.ts                                │
│  - All TypeScript interfaces & types                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DB                                 │
├──────────────┬──────────────┬─────────────────┬─────────────────┤
│ alert_rules  │ behavioral_  │ alert_           │   auth.users    │
│              │ alerts       │ preferences     │                 │
└──────────────┴──────────────┴─────────────────┴─────────────────┘
```

---

## Alert Categories

| Category   | Description                                              | Example Trigger                    |
|------------|----------------------------------------------------------|------------------------------------|
| **Impulse**    | Detects impulsive spending patterns                  | 3+ impulse-tagged transactions/week |
| **Budget**     | Budget threshold warnings and overages               | Spending exceeds category budget   |
| **Habit**      | Habit score degradation alerts                        | Avg habit score drops below 70     |
| **Savings**    | Savings rate and opportunity alerts                   | Savings rate falls below 20%      |
| **Emotional**  | Stress/emotion-driven spending detection              | 2+ stress-tagged transactions/week |
| **Pattern**    | Time-based and recurring pattern detection            | Late-night spending detected      |
| **Milestone**  | Achievement and streak celebrations                   | 7-day tracking streak reached     |
| **Security**   | Unusual activity and security alerts                  | High-risk transaction detected    |

---

## Alert Triggers

### Built-in Triggers

```typescript
// Transaction-based trigger
{ type: 'transaction', filter: { behavioralCategory: 'Impulse' } }

// Time-based trigger (daily/weekly summary)
{ type: 'daily_summary' }
{ type: 'weekly_summary' }

// Streak change trigger
{ type: 'streak_change', direction: 'increase' | 'decrease' }

// Budget exceeded trigger
{ type: 'budget_exceeded', category: 'Dining' }

// Emotion spike trigger
{ type: 'emotion_spike', emotion: 'Stress', threshold: 2 }

// Scheduled trigger
{ type: 'time_trigger', time: '09:00', days: [1] } // Monday 9am
```

### Metric Conditions

```typescript
interface ThresholdCondition {
  metric: AlertMetric;     // spending_total, emotion_impulse_count, risk_score_avg, etc.
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
  window?: 'daily' | 'weekly' | 'monthly';
}
```

---

## Default Alert Rules

| Rule Name                    | Category  | Severity | Threshold                    |
|------------------------------|-----------|----------|------------------------------|
| Impulse Spending Spike       | Impulse   | Warning  | ≥3 impulse tx/week           |
| Dopamine Hit Accumulation    | Impulse   | Info     | ≥4 dopamine hits/week       |
| Stress Spending Warning     | Emotional | Alert    | ≥2 stress tx/week            |
| Late Night Spending Pattern  | Pattern   | Warning  | ≥2 late-night tx/week        |
| High Risk Transaction        | Pattern   | Alert    | Risk score ≥80               |
| Habit Score Decline          | Habit     | Warning  | Avg habit score <70           |
| Savings Rate Alert           | Savings   | Alert    | Savings rate <20%            |
| Weekly Spending Summary      | Pattern   | Info     | Weekly digest                |
| Streak Milestone             | Milestone | Info     | 7+ day streak                |
| Budget Variance Alert        | Budget    | Alert    | Budget exceeded              |

---

## Database Schema

### Tables

1. **alert_rules** — User-configurable alert rule definitions
2. **behavioral_alerts** — Individual alert instances
3. **alert_preferences** — User notification preferences

### Key Columns

**alert_rules**
- `id`, `user_id`, `name`, `description`
- `category`, `severity`, `priority`
- `triggers` (JSONB), `conditions` (JSONB), `conditions_logic`
- `channels[]`, `timing`, `quiet_hours`
- `cooldown_minutes`, `max_per_day`, `snooze_until`
- `enabled`, `auto_resolve`, `show_in_feed`, `thresholds`

**behavioral_alerts**
- `id`, `rule_id`, `user_id`
- `title`, `message`, `category`, `severity`, `priority`
- `trigger_data`, `transactions`, `metric_values` (JSONB)
- `status`, `created_at`, `acknowledged_at`, `resolved_at`
- `delivered_to[]`, `delivery_status`, `viewed`, `view_count`

---

## Component Library

### Core Components

| Component              | Purpose                                      |
|------------------------|----------------------------------------------|
| `AlertCard`            | Individual alert display with actions        |
| `AlertFeed`            | Scrollable list of alerts with filtering     |
| `AlertBadge`           | Notification badge with count                |
| `AlertStatsCard`       | Statistics display card                      |
| `AlertSummary`         | Overview grid of alert statistics            |
| `AlertSettingsPanel`   | Modal for configuring alert preferences      |
| `ToastNotification`    | Temporary notification popup                |
| `AlertsPage`           | Full-page alert management interface         |

### React Hooks

```typescript
// Main hook
const { alerts, rules, preferences, unreadCount, ...actions } = useAlerts();

// Filtered views
const activeAlerts = useActiveAlerts();
const impulseAlerts = useAlertsByCategory('impulse');
const criticalAlerts = useAlertsBySeverity('critical');
```

---

## Usage Examples

### Basic Alert Feed

```tsx
import { AlertsProvider } from './services/alerts';
import { AlertFeed, AlertSummary } from './services/alerts/AlertComponents';

function Dashboard() {
  return (
    <AlertsProvider>
      <AlertSummary />
      <AlertFeed 
        filter={{ status: 'active' }}
        showActions={true}
      />
    </AlertsProvider>
  );
}
```

### Manual Alert Evaluation

```typescript
import { useAlerts } from './services/alerts/AlertsContext';

function TransactionPage() {
  const { evaluateAlerts } = useAlerts();
  
  const handleTransaction = async (transaction: Transaction) => {
    // Save transaction...
    
    // Evaluate if any alerts should trigger
    const updatedTransactions = [...existingTransactions, transaction];
    await evaluateAlerts(updatedTransactions);
  };
}
```

### Custom Alert Notification

```typescript
import { createAlert, notifyAlert, getAlertPreferences } from './services/alerts';

const alert = await createAlert({
  ruleId: 'custom-rule',
  userId: user.id,
  title: 'Budget Warning',
  message: 'You\'ve reached 80% of your monthly dining budget.',
  category: 'budget',
  severity: 'warning',
  priority: 'medium',
  triggerData: { budgetPercent: 80 },
  status: 'active',
  deliveredTo: ['in_app', 'push'],
  deliveryStatus: { in_app: 'pending', push: 'pending', email: 'pending', sms: 'pending' },
});

const prefs = await getAlertPreferences(user.id);
if (prefs) {
  await notifyAlert(alert, prefs);
}
```

---

## Integration Checklist

- [ ] Run migration `migration_011_behavioral_alerts.sql`
- [ ] Add `AlertsProvider` to app root
- [ ] Call `evaluateAlerts()` after transaction changes
- [ ] Integrate `AlertsPage` in navigation
- [ ] Add `AlertBadge` to notification bell icon
- [ ] Configure push notification service worker (for push)
- [ ] Set up email edge function for digest notifications

---

## Styling

Uses the DailyStack Pilo/Emerald Mint theme:

- Primary: `#CCFF00`
- Primary Dark: `#C7FF2E`
- Background: `#0A0A0A`
- Surface: `#1A1A1A`

Severity colors:
- Critical: Red `#FF5252`
- Alert: Orange `#FFB800`
- Warning: Yellow `#FFD600`
- Info: Emerald `#00E676`

---

## File Structure

```
app/src/services/alerts/
├── index.ts              # Module exports
├── alertTypes.ts         # TypeScript interfaces
├── alertEngine.ts        # Core evaluation logic
├── alertService.ts       # Supabase CRUD operations
├── alertNotifications.ts # Multi-channel notification delivery
├── AlertsContext.tsx     # React Context provider
└── AlertComponents.tsx  # UI components

supabase/migrations/
└── migration_011_behavioral_alerts.sql

app/src/components/
└── AlertsPage.tsx        # Full page view
```
