@'
{"mailer_autoconfirm": true}
'@ | Out-File -FilePath "$env:TEMP\supabase-patch.json" -Encoding UTF8 -NoNewline
$body = Get-Content "$env:TEMP\supabase-patch.json" -Raw
$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/config/auth'
try {
    $result = Invoke-RestMethod -Method Patch -Uri $uri -Headers $headers -Body $body -ContentType 'application/json'
    $result | ConvertTo-Json -Depth 10
    Write-Host "SUCCESS"
} catch {
    $err = $_.Exception.Response
    $stream = $err.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "ERROR: $($err.StatusCode) - $body"
}
