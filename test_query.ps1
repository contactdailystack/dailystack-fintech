$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}
$body = '{"query": "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ''profiles'';"}'
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/database/query'
try {
    $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json'
    Write-Host "SUCCESS: database/query"
    $result | ConvertTo-Json -Depth 10
} catch {
    $err = $_.Exception.Response
    if ($err) {
        $stream = $err.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "ERROR: $($err.StatusCode) - $body"
    } else {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
}

$uri2 = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/query'
try {
    $result = Invoke-RestMethod -Method Post -Uri $uri2 -Headers $headers -Body $body -ContentType 'application/json'
    Write-Host "SUCCESS: query"
    $result | ConvertTo-Json -Depth 10
} catch {
    $err = $_.Exception.Response
    if ($err) {
        $stream = $err.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "ERROR: $($err.StatusCode) - $body"
    } else {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
}
