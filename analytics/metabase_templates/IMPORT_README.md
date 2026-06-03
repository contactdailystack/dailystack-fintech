Metabase import templates

Files in this folder are example Metabase question JSON objects you can import as saved questions.

Steps to import
1) Open Metabase (or Supabase's built-in charts if using that).\n2) Create a new "Native query" question and paste the SQL from `analytics/activation_funnel.sql` or `analytics/retention_cohorts.sql` OR import these JSON templates via Metabase Admin -> Import.
3) Map `{{start_date}}` and `{{end_date}}` to dashboard filters when adding to a dashboard.

Note: The `database` id in the JSON is a placeholder (1). Adjust after import if needed.
