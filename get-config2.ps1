$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
}
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/config/auth'
try {
    $result = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -ContentType 'application/json'
    $result | ConvertTo-Json -Depth 10 | Out-File -FilePath config.json -Encoding utf8
    Write-Host "Config saved to config.json"
} catch {
    $err = $_.Exception.Response
    $stream = $err.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "ERROR: $($err.StatusCode) - $body"
}

