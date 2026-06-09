$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}

$migrationPath = 'supabase/migrations/009_add_emotion_to_subscriptions.sql'
if (-not (Test-Path $migrationPath)) {
    Write-Error "Migration file not found at $migrationPath"
    exit 1
}

$sqlContent = Get-Content -Path $migrationPath -Raw
$escapedSql = $sqlContent -replace '\\', '\\\\' -replace '"', '\"' -replace "`r", "" -replace "`n", "\n"

$body = "{`"query`": `"$escapedSql`"}"
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/database/query'

try {
    $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json'
    Write-Host "SUCCESS: Migration 009 applied to database."
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
