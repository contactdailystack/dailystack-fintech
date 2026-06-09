$lines = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)
# The password toggle button's style={iconButtonStyle} is on line 68 (1-indexed)
# Add aria-label as a new line before it
$lines[67] = "              aria-label={showPassword ? 'Hide password' : 'Show password'}"
$lines[68] = "              style={iconButtonStyle}"
[System.IO.File]::WriteAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', $lines, [System.Text.Encoding]::UTF8)
Get-Content 'D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx' -Encoding UTF8 | Select-String "aria-label"
