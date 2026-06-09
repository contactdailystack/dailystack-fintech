const fs = require('fs');
const path = "D:\\Coding Folder\\dailystack-fintech\\app\\src\\services\\AuthContext.tsx";
let content = fs.readFileSync(path, "utf-8");

const old = `export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const user = getCurrentUser();
    return {
      user,
      tier: 'basic',
      fbis: null,
      profileName: null,
      loading: !!user,
      error: null,
    };
  });

  const refreshFBIS = useCallback(async () => {
    const fbis = await getOrInitFBIS();
    setState(prev => ({ ...prev, fbis }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {`;

const newCode = `export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tier: 'basic',
    fbis: null,
    profileName: null,
    loading: true,
    error: null,
  });

  const refreshFBIS = useCallback(async () => {
    const fbis = await getOrInitFBIS();
    setState(prev => ({ ...prev, fbis }));
  }, []);

  // Load current user + register auth state listener on mount
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();

      if (!user) {
        setState({ user: null, tier: 'basic', fbis: null, profileName: null, loading: false, error: null });
        return;
      }

      const [profile, fbis] = await Promise.all([
        getUserProfile(),
        getOrInitFBIS(),
      ]);

      setState({
        user,
        tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
        fbis,
        profileName: profile?.full_name || null,
        loading: false,
        error: null,
      });
    };

    init();

    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        setState({ user: null, tier: 'basic', fbis: null, profileName: null, loading: false, error: null });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const [profile, fbis] = await Promise.all([
        getUserProfile(),
        getOrInitFBIS(),
      ]);

      setState({
        user,
        tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
        fbis,
        profileName: profile?.full_name || null,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {`;

if (content.includes(old)) {
    content = content.replace(old, newCode);
    fs.writeFileSync(path, content, "utf-8");
    console.log("Done");
} else {
    console.log("Pattern not found");
    const idx = content.indexOf("export function AuthProvider");
    console.log(content.substring(idx, idx + 800));
}
