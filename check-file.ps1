# Read the file as bytes to check for encoding issues
$bytes = [System.IO.File]::ReadAllBytes("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx")
Write-Host "File size: $($bytes.Length) bytes"

# Check first 10 bytes
Write-Host "First 20 bytes (hex):"
for ($i = 0; $i -lt 20; $i++) {
    Write-Host "$i : $($bytes[$i]) ($([char]$bytes[$i]))"
}

# Check for BOM
if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "UTF-8 BOM detected at start"
} else {
    Write-Host "No UTF-8 BOM at start"
}

# Check lines around the key areas
$lines = [System.IO.File]::ReadAllLines("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx", [System.Text.Encoding]::UTF8)
Write-Host "Total lines: $($lines.Length)"

# Show lines 1-3
Write-Host "Lines 1-3:"
for ($i = 0; $i -lt 3; $i++) {
    Write-Host "L$($i+1): $($lines[$i])"
}

# Show lines 394-400
Write-Host "`nLines 394-400:"
for ($i = 393; $i -lt 400; $i++) {
    Write-Host "L$($i+1): $($lines[$i])"
}

# Show lines 1150-1160
Write-Host "`nLines 1150-1160:"
for ($i = 1149; $i -lt 1160; $i++) {
    Write-Host "L$($i+1): $($lines[$i])"
}
