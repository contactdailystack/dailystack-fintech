$lines = [System.IO.File]::ReadAllLines("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx", [System.Text.Encoding]::UTF8)

# Show lines 1135-1155
Write-Host "Lines 1135-1155:"
for ($i = 1134; $i -lt 1155; $i++) {
    Write-Host "L$($i+1): $($lines[$i])"
}
