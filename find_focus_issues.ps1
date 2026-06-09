$components = Get-ChildItem "D:\Coding Folder\dailystack-fintech\app\src\components" -Filter "*.tsx" -Name
$issues = @()
foreach ($f in $components) {
    $path = "D:\Coding Folder\dailystack-fintech\app\src\components\$f"
    $content = Get-Content $path -Encoding UTF8
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        if ($line -match 'focus:outline-none') {
            $hasFocusBorder = ($line -match 'focus:border') -or ($line -match 'focus-visible:border')
            $hasFocusRing = ($line -match 'focus:ring') -or ($line -match 'focus-visible:ring')
            if (-not $hasFocusBorder -and -not $hasFocusRing) {
                $issues += "$f`:$lineNum"
            }
        }
    }
}
if ($issues.Count -eq 0) {
    Write-Host "CLEAN: All focus:outline-none have visible focus indicators" -ForegroundColor Green
} else {
    Write-Host "Found $($issues.Count) lines needing focus indicators:" -ForegroundColor Yellow
    $issues | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
}
