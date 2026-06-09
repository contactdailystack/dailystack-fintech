$json = '{"url": "https://supabase.com/dashboard/project/pexcvfhuvqrwrabpgkzi/auth/providers?method=github", "active": true}'
$mavisArgs = @('browser', 'tool', 'open_tab', $json)
& 'C:\Users\Pick\.mavis\bin\mavis.cmd' $mavisArgs
