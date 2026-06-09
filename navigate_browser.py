import subprocess
import json
import os

mavis_path = r"C:\Users\Pick\.mavis\bin\mavis.cmd"

# Navigate to Supabase
url = "https://supabase.com/dashboard/project/pexcvfhuvqrwrabpgkzi/auth/providers?method=github"

result = subprocess.run(
    [mavis_path, "browser", "tool", "navigate"],
    input=json.dumps({"url": url}),
    capture_output=True,
    text=True
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
