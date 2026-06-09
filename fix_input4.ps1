$bt = [char]96
$lines = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)
# Print current state of lines 67-70
for ($i = 66; $i -le 70; $i++) { Write-Output "$($i+1): $($lines[$i])" }
Write-Output "---"
# Fix: keep line 67 (style), add aria-label on 68, remove line 69 (duplicate style), move > to 70
$lines[67] = "              aria-label={showPassword ? 'Hide password' : 'Show password'}"
$lines[68] = "            >"
$lines[69] = ""  # remove this line
# Actually just remove it from the array
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq 69) { continue }  # skip the duplicate style line
    $newLines += $lines[$i]
}
[System.IO.File]::WriteAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', $newLines, [System.Text.Encoding]::UTF8)
Write-Output "Fixed. Lines 66-71 now:"
$fixed = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)
for ($i = 66; $i -le 71; $i++) { Write-Output "$($i+1): $($fixed[$i])" }
