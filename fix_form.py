import re

with open('ActivityPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Fix the corrupted line 639 (index 638) - line merges </label> with <form>
    if i == 638 and '</label>' not in line and '<form' in line:
        # The line has: "...อารมณ์กำกับ            <form..." (truncated)
        # Insert closing label tag and proper form opening
        new_lines.append("                    </label>\n")
        new_lines.append("                  <form onSubmit={handleAddNewTx} className=\"space-y-4 text-left overflow-y-auto max-h-[50vh] pr-1\" id=\"add-tx-form\">\n")
        continue
    new_lines.append(line)

# Now re-indent form content
# Form fields from index 642 (line 643) to index 862 (line 863, formError) 
# need to be indented 3 more spaces to be inside the form
FORM_START = 643  # index (1-based line number, form fields start)
FORM_END = 863    # index (1-based line number, formError ends)
FORM_CLOSE_LINE = 885  # line number where </form> is (after fixing)

result = []
form_content_indented = False
for i, line in enumerate(lines):
    line_num = i + 1
    
    # After adding the form opening at index 639, the rest shifts by 1
    # Adjust indices based on whether we already added lines
    if i < 639:
        result.append(line)
    elif i == 639:
        result.append("                    </label>\n")
        result.append("                  <form onSubmit={handleAddNewTx} className=\"space-y-4 text-left overflow-y-auto max-h-[50vh] pr-1\" id=\"add-tx-form\">\n")
        form_content_indented = True
    else:
        result.append(line)

# Now fix indentation for form content
result2 = []
skip_next = 0
for i, line in enumerate(result):
    if skip_next > 0:
        skip_next -= 1
        continue
    line_num = i + 1
    
    # Skip the label fix and form opening we added
    if i == 638 and '                    </label>' in line:
        continue
    if i == 639 and '<form onSubmit' in line:
        continue
    
    # Form fields: indent by 3 more spaces (12 more for 4-space indent)
    # Form starts at line 645 (index 644), ends at formError at line 863 (index 862)
    if 644 <= i <= 862:
        # Only indent lines that are actual content (not just whitespace)
        if line.strip():
            result2.append('                    ' + line)
        else:
            result2.append(line)
    else:
        result2.append(line)

with open('ActivityPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(result2)

print(f"Done. Total lines: {len(result2)}")
