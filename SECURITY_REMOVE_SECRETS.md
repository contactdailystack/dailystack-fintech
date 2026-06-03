Security steps to remove leaked secrets and rotate keys

1) Immediate: Rotate leaked keys in Supabase
- Open Supabase dashboard -> Project -> Settings -> API
- Rotate any keys that may have been exposed (service_role, anon, etc.)
- Update deployment secret store(s) with new values

2) Remove file from repository (already deleted locally)
- Ensure `.env.local` is removed and added to `.gitignore`

3) Purge Git history (recommended: `git-filter-repo`)
- Install `git-filter-repo` (Python):

```powershell
pip install git-filter-repo
```

- Mirror the repo, run filter, and push force:

```powershell
# on a separate clone/machine
git clone --mirror <REPO_URL> repo-mirror.git
cd repo-mirror.git
# remove the file from all history
git filter-repo --invert-paths --paths .env.local
# push changes back
git push --force --all
git push --force --tags
```

Alternative: Using BFG (Java)

```powershell
# clone mirror
git clone --mirror <REPO_URL>
# run BFG to delete file
java -jar bfg.jar --delete-files .env.local repo.git
cd repo.git
# cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive
# push
git push --force
```

4) Team instructions after purge
- Everyone must re-clone the repository (old clones still have secrets in history)
- Rotate any external credentials which were possibly exposed
- Verify CI/CD does not use the old leaked keys

5) Follow-ups
- Add secret scanning to CI and a pre-commit hook (e.g., detect `.env` patterns)
- Verify staging runs and smoke tests pass with new secrets

Notes
- Do NOT rely solely on deleting the file from the latest commit — you must purge history.
- If you want, I can prepare the exact `git filter-repo` commands and a short PR that updates `.gitignore` and removes `.env.local` (done) and an example CI job for secret-scanning.