path = r'D:\Coding Folder\dailystack-fintech\app\src\pages\SignupPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("navigate('/verify')", "navigate(`/verify?uid=${data.user.id}`)")
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
