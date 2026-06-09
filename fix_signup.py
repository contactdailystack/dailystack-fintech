bt = chr(96)
dollar = chr(36)
line = "      navigate(" + bt + "/verify?uid=" + bt + dollar + "{data.user.id}" + bt + ")"
lines = []
with open(r'D:\Coding Folder\dailystack-fintech\app\src\pages\SignupPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
lines[68] = line + "\n"
with open(r'D:\Coding Folder\dailystack-fintech\app\src\pages\SignupPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('done: ' + repr(lines[68]))
