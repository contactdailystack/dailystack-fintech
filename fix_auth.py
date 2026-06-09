path = r"D:\Coding Folder\dailystack-fintech\app\src\services\AuthContext.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  // Register auth state listener ONCE on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        setState({ user: null, tier: 'basic', fbis: null, profileName: null, loading: false, error: null });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch profile + FBIS in parallel
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
  }, []);'''

new = '''export function AuthProvider({ children }: { children: React.ReactNode }) {
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
  }, []);'''

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done")
else:
    print("Pattern not found - checking for alternative patterns")
    # Try to find what's actually there
    idx = content.find("export function AuthProvider")
    if idx >= 0:
        print(repr(content[idx:idx+200]))
