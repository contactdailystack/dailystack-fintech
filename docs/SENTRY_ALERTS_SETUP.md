Sentry Alerting — Setup Guide

Recommended alert rules (examples)
1) High error rate (spike)
   - Trigger: error count increase > 200% over 5 minutes vs baseline
   - Action: Slack critical channel, PagerDuty
2) New release regressions
   - Trigger: increase in errors in the latest release compared to previous release
   - Action: Slack #deploy-alerts, create issue
3) Frequent specific error
   - Trigger: a single error fingerprint occurs > 50 times in 10 minutes
   - Action: Slack, email to dev-owner
4) Performance transaction threshold
   - Trigger: transaction P95 > 2s for important transactions (e.g., `checkout`, `auth`) for 10 minutes
   - Action: Ops paging, Slack

How to create rules (UI)
- Go to Sentry → Project → Alerts → New Alert → Choose "Issue Alert" or "Metric Alert" → configure conditions and actions.

Create alerts via API (curl)
- You can create alert rules programmatically using Sentry REST API. Example to create a simple issue alert (replace placeholders):

```bash
curl -X POST "https://sentry.io/api/0/projects/{org_slug}/{project_slug}/alerts/rules/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High error spike",
    "actionMatch": "all",
    "actions": [{"id":"sentry.integrations.slack.create_issue","settings":{}}],
    "conditions": [{"id":"sentry.rules.conditions.error_rate.IncreaseCondition","value":200}],
    "filters": []
  }'
```

Integrations
- Slack: add the Sentry Slack integration and configure channel routing for alerts.
- PagerDuty: connect PagerDuty for on-call paging.
- Email: fallback notifications to a team inbox.

On-call & Escalation
- Configure severity mapping (critical → page, warning → Slack). Set business hours and escalation policies.

Testing alerts
1. Trigger a test error in staging (temporary throw) and confirm alert fires. Example snippet for frontend:

```js
if (window.location.search.includes('sentry_test')) { throw new Error('Sentry test error'); }
```

2. Use Sentry's test notification features in the alert rule UI to verify integration (Slack/PagerDuty).

Notes
- Keep alert noise low: tune thresholds to avoid paging for minor, expected errors.
- Use rate-limiting and sampling for performance traces — `tracesSampleRate` is set in frontend init; adjust for production.
