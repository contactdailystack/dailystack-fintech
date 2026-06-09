$lines = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)
# Find the button element with role="button" and tabIndex={-1} inside the isPasswordIcon block
# and add aria-label before tabIndex
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'isPasswordIcon.*\(.*\)' -or $lines[$i] -match 'role="button"' -and $i -gt 0 -and $lines[$i-1] -match 'isPasswordIcon') {
        # Check if this is the password toggle button (look for tabIndex={-1} nearby)
        if ($i -lt $lines.Count - 1 -and $lines[$i+1] -match 'tabIndex.*-1') {
            $lines[$i] = $lines[$i] + "`n              aria-label={showPassword ? 'Hide password' : 'Show password'}"
            break
        }
    }
}
[System.IO.File]::WriteAllLines('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', $lines, [System.Text.Encoding]::UTF8)
"done"
