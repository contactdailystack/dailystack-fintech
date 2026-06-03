-- Activation funnel SQL for Supabase/Metabase
-- Replace :start_date and :end_date with actual dates or use dashboard parameters

-- 1) Count signups per day
SELECT
  date_trunc('day', created_at) AS day,
  count(*) FILTER (WHERE event_name = 'signup_completed') AS signups
FROM user_events
WHERE created_at BETWEEN :start_date AND :end_date
GROUP BY day
ORDER BY day;

-- 2) Count first subscription added per day
SELECT
  date_trunc('day', ue.created_at) AS day,
  count(DISTINCT ue.user_id) FILTER (WHERE ue.event_name = 'first_subscription_added') AS first_subs
FROM user_events ue
WHERE ue.created_at BETWEEN :start_date AND :end_date
GROUP BY day
ORDER BY day;

-- 3) Count second subscription added per day
SELECT
  date_trunc('day', ue.created_at) AS day,
  count(DISTINCT ue.user_id) FILTER (WHERE ue.event_name = 'second_subscription_added') AS second_subs
FROM user_events ue
WHERE ue.created_at BETWEEN :start_date AND :end_date
GROUP BY day
ORDER BY day;

-- 4) Aha moment seen (totals + savings) per day
SELECT
  date_trunc('day', created_at) AS day,
  count(DISTINCT user_id) FILTER (WHERE event_name = 'aha_moment_seen') AS aha_seen
FROM user_events
WHERE created_at BETWEEN :start_date AND :end_date
GROUP BY day
ORDER BY day;

-- 5) Funnel summary for date range
WITH
  s AS (
    SELECT count(DISTINCT user_id) AS signups FROM user_events WHERE event_name = 'signup_completed' AND created_at BETWEEN :start_date AND :end_date
  ),
  f1 AS (
    SELECT count(DISTINCT user_id) AS first FROM user_events WHERE event_name = 'first_subscription_added' AND created_at BETWEEN :start_date AND :end_date
  ),
  f2 AS (
    SELECT count(DISTINCT user_id) AS second FROM user_events WHERE event_name = 'second_subscription_added' AND created_at BETWEEN :start_date AND :end_date
  ),
  a AS (
    SELECT count(DISTINCT user_id) AS aha FROM user_events WHERE event_name = 'aha_moment_seen' AND created_at BETWEEN :start_date AND :end_date
  )
SELECT s.signups, f1.first AS first_added, f2.second AS second_added, a.aha AS aha_seen
FROM s, f1, f2, a;
