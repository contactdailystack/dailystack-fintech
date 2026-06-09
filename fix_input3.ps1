# Fix Input.tsx: find and replace the button block for password toggle
$content = [System.IO.File]::ReadAllText('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', [System.Text.Encoding]::UTF8)

# The old button block (with aria-label added before style, but style appears twice)
$old = @'
              style={iconButtonStyle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={iconButtonStyle}
            >
'@

# The correct button block
$new = @'
              style={iconButtonStyle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
'@

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    [System.IO.File]::WriteAllText('D:\Coding Folder\dailystack-fintech\app\src\components\ui\Input.tsx', $content, [System.Text.Encoding]::UTF8)
    "Fixed: replaced duplicate style with aria-label"
} else {
    "Pattern not found - checking current state..."
    $lines = $content -split "`n"
    for ($i=0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'aria-label|iconButtonStyle') {
            "$($i+1): $($lines[$i])"
        }
    }
}
