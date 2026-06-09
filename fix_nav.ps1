$target = '      navigate(`/verify?uid=${data.user.id}`)' + "`n"
$lines = [System.IO.File]::ReadAllLines('D:\Coding Folder\dailystack-fintech\app\src\pages\SignupPage.tsx', [System.Text.Encoding]::UTF8)
$lines[68] = '      navigate(`/verify?uid=${data.user.id}`)'
[System.IO.File]::WriteAllLines('D:\Coding Folder\dailystack-fintech\app\src\pages\SignupPage.tsx', $lines, [System.Text.Encoding]::UTF8)
Get-Content 'D:\Coding Folder\dailystack-fintech\app\src\pages\SignupPage.tsx' -Encoding UTF8 | Select-Object -Index 68
