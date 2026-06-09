$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/database/query'
$tables = @(
    'user_wallets', 'profiles', 'subscriptions', 'user_memberships',
    'user_transactions', 'alert_rules', 'behavioral_alerts',
    'alert_preferences', 'user_subscriptions', 'user_security',
    'user_preferences', 'ai_coaching_sessions', 'user_financial_profiles'
)
foreach ($t in $tables) {
    $body = @{ query = "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$t'" } | ConvertTo-Json -Compress
    try {
        $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 10
        $exists = $result.Count -gt 0
        $color = if ($exists) { 'Green' } else { 'Red' }
        Write-Host "$t : $exists" -ForegroundColor $color
    } catch {
        Write-Host "$t : ERROR" -ForegroundColor Yellow
    }
}
