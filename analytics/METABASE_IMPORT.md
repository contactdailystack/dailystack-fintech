Metabase Quick Import — DailyStack Analytics
==========================================

Overview
--------
This folder contains ready-to-paste Metabase native queries for Activation Funnel and Retention Cohorts.

Files
-----
- `activation_query.json` — native query template for the activation funnel
- `retention_query.json` — native query template for retention cohorts

Quick steps (manual, 2–3 minutes)
--------------------------------
1. Open your Metabase instance and log in as an admin or editor.
2. Create a new Question -> Native query.
   - Open `analytics/metabase_templates/activation_query.json` and copy the `dataset_query.native.query` SQL.
   - Paste into Metabase Native query editor, set the correct database (your Supabase DB), and save as "Activation Funnel - DailyStack".
3. Repeat for `retention_query.json` and save as "Retention Cohorts - DailyStack".
4. Create a new Dashboard and add both saved Questions as cards.
   - For the Activation card, set visualization to Line/Area or Table as you prefer.
   - For the Cohorts card, use Table visualization.
5. Save the Dashboard and optionally share/embed or pin to Home.

Optional: automated import
-------------------------
If you want a single JSON you can import via Metabase's Admin -> Settings -> Lab -> Import, I can generate an export file that includes both cards and a dashboard — tell me the Metabase `database id` (found in Admin -> Databases -> click your DB and check the URL or API), and I will produce a ready-to-import JSON in this repo.

What I can do next
------------------
- Create the Metabase import JSON for one-click import (need `database id`), or
- Generate a dashboard screenshot and a short walkthrough for sharing with stakeholders.

Pick one and I'll proceed.
