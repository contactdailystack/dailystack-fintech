@echo off
rem This script navigates to Supabase using mavis browser tool
set MAVIS=C:\Users\Pick\.mavis\bin\mavis.cmd
set JSON={"url": "https://supabase.com/dashboard/project/pexcvfhuvqrwrabpgkzi/auth/providers?method=github", "active": true}
call %MAVIS% browser tool open_tab %JSON%
