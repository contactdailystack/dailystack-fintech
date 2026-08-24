# Test if there's a JSX parsing issue by checking for specific patterns
$content = [System.IO.File]::ReadAllText("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx", [System.Text.Encoding]::UTF8)

# Check for common JSX issues
$issues = @()

# 1. Find unclosed JSX expressions (should have matching number of { and })
$openBrace = ($content | Select-String -Pattern '{' -AllMatches).Matches.Count
$closeBrace = ($content | Select-String -Pattern '}' -AllMatches).Matches.Count
Write-Host "Open braces: $openBrace, Close braces: $closeBrace"
if ($openBrace -ne $closeBrace) {
    Write-Host "MISMATCH: Brace count doesn't match!"
}

# 2. Check for unclosed strings
$singleQuote = ($content | Select-String -Pattern "'" -AllMatches).Matches.Count
$doubleQuote = ($content | Select-String -Pattern '"' -AllMatches).Matches.Count
Write-Host "Single quotes: $singleQuote, Double quotes: $doubleQuote"

# 3. Check for `style={{` patterns - these should always have `}}`
$badStyle = $content -split "`n" | Where-Object { $_ -match 'style=\{\{[^}]*\{' }
if ($badStyle) {
    Write-Host "Potential bad style prop (nested brace without closing):"
    $badStyle | ForEach-Object { Write-Host $_ }
}

# 4. Check for self-closing divs
$selfClose = ($content | Select-String -Pattern '<div[^>]*?/>' -AllMatches).Matches.Count
Write-Host "Self-closing divs: $selfClose"

# 5. Look at the line ranges that TypeScript complains about
$lines = $content -split "`n"
Write-Host "`nLines around TypeScript errors (1150-1180):"
for ($i = 1149; $i -lt [Math]::Min(1180, $lines.Length); $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1
    # Check for template literals that might be unclosed
    $backticks = (($line | Select-String -Pattern '`' -AllMatches).Matches.Count)
    if ($backticks % 2 -ne 0) {
        Write-Host "L$lineNum [ODD BACKTICK]: $line"
    } else {
        # Just show the line
        Write-Host "L$lineNum : $($line.Substring(0, [Math]::Min(100, $line.Length)))"
    }
}
