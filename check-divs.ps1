$lines = [System.IO.File]::ReadAllLines("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx", [System.Text.Encoding]::UTF8)

$open = 0
$close = 0
$openStack = @()
$closeStack = @()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1
    
    # Count self-closing divs (ends with />)
    $selfClose = ($line -match '<div.*?/>\s*$')
    
    # Count opening divs
    $openCount = ([regex]::Matches($line, '<div(?![/]).*?>')).Count
    # Count closing divs
    $closeCount = ([regex]::Matches($line, '</div>')).Count
    
    if ($openCount -gt 0 -and !$selfClose) {
        $open += $openCount
        for ($j = 0; $j -lt $openCount; $j++) {
            $openStack += $lineNum
        }
        Write-Host "L$lineNum : +$openCount open (total=$open) : $($line.Substring(0, [Math]::Min(70, $line.Length)))"
    }
    
    if ($closeCount -gt 0) {
        $close += $closeCount
        for ($j = 0; $j -lt $closeCount; $j++) {
            if ($openStack.Length -gt 0) {
                $matched = $openStack[$openStack.Length - 1]
                $openStack = $openStack[0..($openStack.Length - 2)]
                Write-Host "L$lineNum : -$closeCount close (total=$close) matched L$matched : $($line.Substring(0, [Math]::Min(70, $line.Length)))"
            } else {
                Write-Host "L$lineNum : -$closeCount close (total=$close) NO MATCH : $($line.Substring(0, [Math]::Min(70, $line.Length)))"
            }
        }
    }
}

Write-Host ""
Write-Host "Final: open=$open close=$close"
if ($openStack.Length -gt 0) {
    Write-Host "Unclosed at lines: $($openStack -join ', ')"
}
