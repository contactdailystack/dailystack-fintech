-- Retention cohorts SQL (D1, D7, D30) based on first active date
-- Assumes `user_events` contains `signup_completed` and `first_subscription_added`

WITH first_activity AS (
  SELECT user_id, MIN(created_at) AS first_seen
  FROM user_events
  WHERE event_name IN ('signup_completed','first_subscription_added')
  GROUP BY user_id
),
events AS (
  SELECT ue.user_id, ue.event_name, ue.created_at, fa.first_seen
  FROM user_events ue
  JOIN first_activity fa ON fa.user_id = ue.user_id
  WHERE ue.created_at BETWEEN fa.first_seen AND fa.first_seen + interval '30 days'
)

SELECT
  date_trunc('day', first_seen) AS cohort_day,
  COUNT(DISTINCT user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN created_at < first_seen + interval '1 day' THEN user_id END) AS d0_active,
  COUNT(DISTINCT CASE WHEN created_at < first_seen + interval '2 day' THEN user_id END) AS d1_active,
  COUNT(DISTINCT CASE WHEN created_at < first_seen + interval '8 day' THEN user_id END) AS d7_active,
  COUNT(DISTINCT CASE WHEN created_at < first_seen + interval '31 day' THEN user_id END) AS d30_active
FROM events
GROUP BY cohort_day
ORDER BY cohort_day;
