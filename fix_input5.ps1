$lines = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)
$lines[68] = "              aria-label={showPassword ? 'Hide password' : 'Show password'}"
$lines[69] = "            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>"
$lines[70] = "          )}"
# Remove the old content lines 71 onwards
$newLines = @()
for ($i = 0; $i -le 69; $i++) { $newLines += $lines[$i] }
for ($i = 72; $i -lt $lines.Count; $i++) { $newLines += $lines[$i] }
[System.IO.File]::WriteAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', $newLines, [System.Text.Encoding]::UTF8)
Write-Output "Fixed. Lines 61-72:"
$fixed = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)
for ($i = 60; $i -lt 80; $i++) { if ($i -lt $fixed.Count) { Write-Output "$($i+1): $($fixed[$i])" } }
