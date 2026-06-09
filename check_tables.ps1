$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}

$tables = @('behavioral_alerts', 'ai_coaching_sessions', 'user_financial_profiles', 'profiles', 'alert_rules')

foreach ($t in $tables) {
    $body = @{ query = "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$t'" } | ConvertTo-Json -Compress
    $uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/database/query'
    try {
        $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json'
        $exists = $result.Count -gt 0
        Write-Host "$t : EXISTS = $exists"
    } catch {
        Write-Host "$t : ERROR - $($_.Exception.Message)"
    }
}
