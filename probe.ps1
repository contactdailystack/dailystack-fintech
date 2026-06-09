$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
}
# Try different endpoints
$endpoints = @(
    'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi',
    'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/config',
    'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/auth',
    'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/postgresql',
    'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/postgresPassword'
)
foreach ($uri in $endpoints) {
    try {
        $result = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -ContentType 'application/json' -TimeoutSec 5
        Write-Host "SUCCESS: $uri"
        Write-Host ($result | ConvertTo-Json -Depth 3)
    } catch {
        $err = $_.Exception.Response
        if ($err) {
            $stream = $err.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            Write-Host "FAIL $uri : $($err.StatusCode) - $body"
        } else {
            Write-Host "FAIL $uri : $($_.Exception.Message)"
        }
    }
}
