# Fix ActivityPage.tsx corruption
# 1. Fix line 639 (corrupted: </label> + <form> merged)
# 2. Re-indent form content (lines 643-864) to be inside the form
# 3. Add form="add-tx-form" to submit button

with open('ActivityPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

result = []
i = 0
while i < len(lines):
    line = lines[i]
    line_num = i + 1

    # Fix the corrupted line 639
    if line_num == 639 and '</label>' not in line and '<form' in line:
        # Extract the Thai text portion (before the truncation and form merge)
        # The line has: "...อารมณ์กำกับ            <form..."
        # Extract the full Thai string
        thai_text = 'อารมณ์กำกับ'
        result.append("                    <span>🧠 {lang === 'en' ? 'Emotion Layer' : '" + thai_text + "'}</span>")
        result.append("                  </label>")
        result.append("                  <form onSubmit={handleAddNewTx} className=\"space-y-4 text-left overflow-y-auto max-h-[50vh] pr-1\" id=\"add-tx-form\">")
        i += 1
        continue

    # Form fields (lines 643-864): indent by 3 more spaces
    if 643 <= line_num <= 864:
        if line.strip():  # non-empty line
            result.append('                       ' + line)  # 3 more spaces = 18 + 3 = 21? No, current is 18 spaces, add 3 = 21
        else:
            result.append(line)
        i += 1
        continue

    # Submit button: add form="add-tx-form"
    if line_num == 876 and 'id="btn-submit-add-tx"' in line:
        # Insert form attribute
        result.append(line.replace('type="submit"', 'type="submit"\n                  form="add-tx-form"'))
        i += 1
        continue

    result.append(line)
    i += 1

with open('ActivityPage.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result))

print(f"Done. Lines: {len(result)}")
