@'
{"url": "https://supabase.com/dashboard/project/pexcvfhuvqrwrabpgkzi/auth/providers?method=github", "active": true}
'@ | Out-File -FilePath "$env:TEMP\mavis-args.json" -Encoding UTF8 -NoNewline
$mavisArgs = Get-Content "$env:TEMP\mavis-args.json"
$cmd = "C:\Users\Pick\.mavis\bin\mavis.cmd"
& $cmd browser tool open_tab $mavisArgs
