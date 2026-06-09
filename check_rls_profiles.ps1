$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/database/query'

$body = @{
    query = @"
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
  AND schemaname = 'public';
"@
} | ConvertTo-Json -Compress

try {
    $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 15
    if ($result.Count -eq 0) {
        Write-Host "profiles: NO POLICIES - DATA LEAK!" -ForegroundColor Red
    } else {
        Write-Host "profiles: $($result.Count) policy found:" -ForegroundColor Cyan
        $result | ForEach-Object {
            Write-Host "  - $($_.policyname) ($($_.cmd)) qual=$($_.qual | ConvertTo-Json -Compress)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
