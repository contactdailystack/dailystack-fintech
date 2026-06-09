const fs = require('fs');
const path = "D:\\Coding Folder\\dailystack-fintech\\app\\src\\services\\useAuth.ts";
let content = fs.readFileSync(path, "utf-8");

const old = `  const [state, setState] = useState<AuthState>({
    user: getCurrentUser(),
    profile: null,
    tier: 'basic',
    fbis: null,
    loading: !!getCurrentUser(),
    error: null,
  });`;

const replacement = `  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    tier: 'basic',
    fbis: null,
    loading: true,
    error: null,
  });`;

if (!content.includes(old)) {
    console.log("Pattern not found in useAuth.ts");
    const idx = content.indexOf("useState<AuthState>");
    console.log(JSON.stringify(content.substring(idx, idx + 500)));
    process.exit(1);
}

content = content.replace(old, replacement);

// Fix: remove the sync getCurrentUser calls, rely entirely on init()
const oldInit = `    // Kick off profile + FBIS if we already have a user
    const user = getCurrentUser();
    if (user) {
      (async () => {
        const [profile, fbis] = await Promise.all([getUserProfile(), getOrInitFBIS()]);
        setState(prev => ({
          ...prev,
          profile,
          tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
          fbis,
          loading: false,
        }));
      })();
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }`;

const newInit = `    // Profile + FBIS are fetched inside initializeAuthListener when user is known`;

content = content.replace(oldInit, newInit);

fs.writeFileSync(path, content, "utf-8");
console.log("Done");
