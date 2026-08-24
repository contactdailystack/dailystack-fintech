$lines = [System.IO.File]::ReadAllLines("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx", [System.Text.Encoding]::UTF8)

# Lines are 0-indexed. We want to replace lines 1148-1324 (inclusive)
# These correspond to the entire bottom nav IIFE section
# Line 1148 (0-indexed) = line 1149 (1-indexed) = the "=== BOTTOM NAV ===" comment
# Line 1324 (0-indexed) = line 1325 (1-indexed) = </div> closing bottom nav
# Lines 1325+ contain: </div> of return, }, and helper functions

$bottomNavStart = 1148  # 0-indexed
$bottomNavEnd = 1324    # 0-indexed, last line to replace (</div> of bottom nav)

# Build replacement - clean BottomNavBar component
$newSection = @(
'      {/* ============================================================ */}',
'      {/* BOTTOM NAVIGATION BAR - 5 Tabs + Green Active Indicator   */}',
'      {/* ============================================================ */}',
'      <BottomNavBar lang={lang} onNavigate={onNavigate} onPress={handlePress} activeTab="dashboard" />',
'    </div>',
'  );',
'}'
)

$before = $lines[0..($bottomNavStart - 1)]
$after = $lines[($bottomNavEnd + 1)..($lines.Length - 1)]
$newLines = $before + $newSection + $after

[System.IO.File]::WriteAllLines("D:\Coding Folder\dailystack-fintech\app\src\components\DashboardPage.tsx", $newLines, [System.Text.Encoding]::UTF8)
Write-Host "Replaced lines $($bottomNavStart+1) to $($bottomNavEnd+1) with BottomNavBar component"
Write-Host "New file has $($newLines.Length) lines"
