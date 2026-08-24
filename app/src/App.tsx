import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// DailyStack Translations
import { translations, Language } from './data/translations';

// Auth + Tier
import { AuthProvider, useAuthContext } from './services/AuthContext';
import { updateUserTier, updateUserDisplayName } from './services/userTierService';
import type { SubscriptionTier } from './services/userTierService';

// DailyStack sub-pages imports — code-split with React.lazy
const AuthPage              = lazy(() => import('./components/AuthPage'));
const AuthCallbackPage      = lazy(() => import('./components/AuthCallbackPage'));
const AuthResetPasswordPage = lazy(() => import('./components/AuthResetPasswordPage'));
const DashboardPage         = lazy(() => import('./components/DashboardPage'));
const ActivityPage          = lazy(() => import('./components/ActivityPage'));
const InsightsPage          = lazy(() => import('./components/InsightsPage'));
const PaywallPage           = lazy(() => import('./components/PaywallPage'));
const AICoachPage           = lazy(() => import('./components/AICoachPage'));
const ProfileSettingsPage   = lazy(() => import('./components/ProfileSettingsPage'));
const MorePage              = lazy(() => import('./components/MorePage'));
const AICoachHistoryPage    = lazy(() => import('./components/AICoachHistoryPage'));
const BudgetManagementPage  = lazy(() => import('./components/BudgetManagementPage'));
const GoalSimulationPage    = lazy(() => import('./components/GoalSimulationPage'));
const NetWorthPage          = lazy(() => import('./components/NetWorthPage'));
const SubscriptionTrackerPage = lazy(() => import('./components/SubscriptionTrackerPage'));
const AlertsPage             = lazy(() => import('./components/AlertsPage'));
const LegalDocsPage          = lazy(() => import('./components/LegalDocsPage'));
const PdpaConsentBanner      = lazy(() => import('./components/PdpaConsentBanner'));
const AppLockOverlay         = lazy(() => import('./components/AppLockScreen'));

// Wallet
import { getOrCreateWallet } from './services/walletService';
import { loadTransactions, dbTransactionsToActivityTx, deleteTransaction } from './services/transactionService';
import apiService, { InsightsResult } from './services/apiService';
import { loadConsent, ConsentRecord } from './services/consentStore';
import {
  isLockEnabled,
  isSessionUnlocked,
  markUnlocked,
  lockNow,
  AUTOLOCK_MINUTES,
} from './services/appLockService';

// State Simulation and Design wireframes metadata
import type { Goal } from './services/goalService';
import { fetchGoals } from './services/goalService';
import { loadSubscriptions } from './services/subscriptionService';

// Bottom Navigation Component
import FloatingBottomNav from './components/FloatingBottomNav';
import { ErrorBoundary } from './design-system/components/ErrorBoundary';
import { AlertsProvider } from './services/alerts/AlertsContext';
import { AlertsRuntime } from './services/alerts/AlertsRuntime';
import { GlobalAlertBanners } from './services/alerts/GlobalAlertBanners';
import type { AlertRuntimeSub } from './services/alerts/alertEngine';

// Types & Preset Mock Data
import { UserProfile, StockAsset, Transaction, AIInterpretation } from './types';
import {
  INITIAL_PROFILE,
  INITIAL_STOCKS,
  INITIAL_TRANSACTIONS,
  MOCK_INTERPRETATION
} from './data/mockFintechData';

// ─── Real API → UI adapters (P1.3 backend wiring) ──────────────────

function insightsToInterpretation(r: InsightsResult): AIInterpretation {
  return {
    summary: r.insights[0] || r.archetype_label_en,
    confidenceScore: Math.round(r.overall_score),
    archetype: r.archetype_label_en,
    radarAnalysis: {
      impulseRating: Math.round(r.traits.impulse_rating),
      futureOrientation: Math.round(r.traits.future_orientation),
      socialPressureResistance: Math.round(r.traits.social_resistance),
      smartValueSeeking: Math.round(r.traits.value_seeking),
    },
  };
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPageWrapper />} />
          <Route path="/auth/reset" element={
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#0FB0CE] border-t-transparent" />
                  <span className="sr-only">Loading PicksWise</span>
                </div>
              </div>
            }>
              <AuthResetPasswordPage />
            </Suspense>
          } />
          {/* P1-02: /login and /signup routes for Playwright test compatibility */}
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route path="/signup" element={<SignupPageWrapper />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// P1-02: Shared auth wrapper for /login and /signup routes
function AuthPageWrapper({ defaultView }: { defaultView: 'login' | 'register' }) {
  const auth = useAuthContext();
  if (auth.user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#0FB0CE] border-t-transparent" />
      </div>
    }>
      <AuthPage
        onLoginSuccess={() => {
          window.location.href = '/dashboard';
        }}
        defaultView={defaultView}
      />
    </Suspense>
  );
}

function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#0FB0CE] border-t-transparent" />
      </div>
    }>
      <AuthPageWrapper defaultView="login" />
    </Suspense>
  );
}

function SignupPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#0FB0CE] border-t-transparent" />
      </div>
    }>
      <AuthPageWrapper defaultView="register" />
    </Suspense>
  );
}

function AuthCallbackPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#0FB0CE] border-t-transparent" />
          <span className="sr-only">Loading PicksWise</span>
        </div>
      </div>
    }>
      <AuthCallbackPage />
    </Suspense>
  );
}

function AppShell() {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('dslang') as Language) || 'en';
  });

  useEffect(() => {
    // P0-2 fix: Design system is light theme (Rocket Money clone — navy #071838).
    // Do NOT add 'dark' class — Tailwind dark: prefix is no longer in use.
    // Background color via CSS variable --bg-page (defined in tokens.css on html).
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('dslang', lang);
  }, [lang]);

  // Core application database state
  // Money fields start at ZERO — real values arrive from Supabase (no mock flash)
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...INITIAL_PROFILE,
    plan: auth.tier,
    email: auth.user?.email || INITIAL_PROFILE.email,
    name: auth.profileName || INITIAL_PROFILE.name,
    balance: 0,
    portfolioValue: 0,
  }));
  const [stocks] = useState<StockAsset[]>(INITIAL_STOCKS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  /** Active subs for the alert engine (bill-due-soon metric) */
  const [alertSubs, setAlertSubs] = useState<AlertRuntimeSub[]>([]);
  // P1.3: real data from edge functions, mock as initial/fallback
  const [interpretation, setInterpretation] = useState<AIInterpretation>(MOCK_INTERPRETATION);

  // Load real wallet data from Supabase on mount
  useEffect(() => {
    if (!auth.user) return;

    let cancelled = false;

    const loadRealtimeData = async () => {
      const [wallet, dbTxs, insights] = await Promise.all([
        getOrCreateWallet(),
        loadTransactions(),
        apiService.getUserInsights().catch(() => null),
      ]);

      if (cancelled) return;

      setProfile(prev => ({
        ...prev,
        balance: wallet.balance,
        portfolioValue: wallet.balance,
      }));

      // Replace mock transactions with real data from Supabase (if any).
      // Plural mapper attaches notes + synthesizes split rows (#6a/#6d).
      if (dbTxs.length > 0) {
        setTransactions(dbTransactionsToActivityTx(dbTxs));
      }

      // AI Coach: use real insights when available (is_mock=false)
      if (insights && !insights.is_mock) {
        setInterpretation(insightsToInterpretation(insights));
      }

      // Real savings goals (Budget page Goals tab + Goal Simulation)
      fetchGoals(auth.user!.id).then(rows => { if (!cancelled) setGoals(rows); }).catch(err => {
        console.error('[App] Goals load failed:', err);
      });

      // Active subscriptions for the alert engine's bill-due-soon metric
      loadSubscriptions().then(subs => {
        if (!cancelled) {
          setAlertSubs(subs.filter(s => s.isActive).map(s => ({
            id: s.id, name: s.name, amount: s.amount, dueDate: s.dueDate,
          })));
        }
      }).catch(() => { /* manual-first: empty is fine */ });
    };

    loadRealtimeData();

    return () => { cancelled = true; };
  }, [auth.user]);

  // Keep profile in sync with auth state
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      plan: auth.tier,
      email: auth.user?.email || prev.email,
      name: auth.profileName || prev.name,
    }));
  }, [auth.tier, auth.user?.email, auth.profileName]);

  // ─── PDPA consent + App Lock (Platform & Access / Compliance) ───────
  const [consent, setConsent] = useState<ConsentRecord | null>(() => loadConsent());

  const [appLocked, setAppLocked] = useState<boolean>(() =>
    isLockEnabled() && !isSessionUnlocked()
  );

  // Re-check lock when the signed-in user changes (login/logout)
  useEffect(() => {
    setAppLocked(!!auth.user && isLockEnabled() && !isSessionUnlocked());
  }, [auth.user]);

  // Auto-lock on idle + instant re-lock when tab is hidden
  useEffect(() => {
    if (!isLockEnabled()) return;

    const armIdleTimer = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        lockNow();
        setAppLocked(true);
      }, AUTOLOCK_MINUTES * 60 * 1000);
    };
    let idleTimer: number;
    const onActivity = () => armIdleTimer();
    const onVisible = () => {
      if (document.visibilityState === 'hidden') {
        lockNow();
        window.clearTimeout(idleTimer);
      } else if (isLockEnabled()) {
        setAppLocked(true); // returning to a locked session
      }
    };

    armIdleTimer();
    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLockEnabled()]);

  const handleUpdateProfile = async (updatedFields: Partial<UserProfile>) => {
    // Update local state
    setProfile(prev => ({ ...prev, ...updatedFields }));

    // Persist display_name to Supabase users table if provided
    if (updatedFields.name) {
      await updateUserDisplayName(updatedFields.name);
    }
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  };

  const handleDeleteTransaction = async (id: string) => {
    // Synthetic `${id}-split` rows are local-only — skip the DB for them
    if (!id.endsWith('-split')) {
      await deleteTransaction(id);
    }
    setTransactions(prev => {
      const next = prev.filter(tx => tx.id !== id);
      // Cascade: deleting a split source also removes its synthetic twin
      return next.filter(tx => tx.id !== `${id}-split`);
    });
  };

  const handleUpgradeComplete = async (newTier: SubscriptionTier) => {
    await updateUserTier(newTier);
    // Re-fetch profile after tier update � onAuthStateChange will pick it up
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate('/dashboard');
    setProfile(prev => ({ ...INITIAL_PROFILE, balance: 0, portfolioValue: 0 }));
    setTransactions([]);
    setGoals([]);
    setAlertSubs([]);
    setInterpretation(MOCK_INTERPRETATION);
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#0FB0CE] border-t-transparent" />
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Loading PicksWise...</span>
          <span className="sr-only" aria-live="polite">Loading PicksWise</span>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <AuthPage
        onLoginSuccess={() => {
          navigate('/dashboard');
        }}
      />
    );
  }

  const t = translations[lang];

  return (
    <div id="dailystack-root-viewport" className="min-h-screen flex flex-col justify-between selection:bg-brand/45 selection:text-black transition-colors duration-400 bg-dark-bg text-zinc-900 relative overflow-x-hidden">

      {/* Behavioral alerts: global provider + RM-style banners (authed only) */}
      <AlertsProvider>
        <AlertsRuntime
          balance={profile.balance}
          transactions={transactions}
          subscriptions={alertSubs}
        />
        <GlobalAlertBanners lang={lang} />

      {/* Main interactive layout routing block */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-32 md:px-8 md:pt-8 md:pb-36" id="dailystack-workspace">

        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#0FB0CE] border-t-transparent animate-spin" />
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Loading module...</span>
            </div>
          </div>
        }>
          <Routes>
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <div data-testid="dashboard-page">
                <DashboardPage
                  profile={profile}
                  stocks={stocks}
                  transactions={transactions}
                  onNavigate={(tab) => navigate(`/${tab === 'overview' ? 'dashboard' : tab}`)}
                  onUpdateProfile={handleUpdateProfile}
                  onAddTransaction={handleAddTransaction}
                  onNavigateToUpgrade={() => navigate('/paywall')}
                  lang={lang}
                  isAuthenticated={!!auth.user}
                />
              </div>
            } />

            <Route path="/subscriptions" element={
              <SubscriptionTrackerPage
                lang={lang}
                theme="light"
                paydayDay={profile.paydayDay}
                onNavigateToUpgrade={() => navigate('/paywall')}
              />
            } />

            <Route path="/networth" element={
              <NetWorthPage lang={lang} />
            } />

            <Route path="/activity" element={
              <ActivityPage
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                lang={lang}
              />
            } />

            <Route path="/settings" element={
              <ProfileSettingsPage
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onLogout={handleLogout}
                onNavigateToUpgrade={() => navigate('/paywall')}
                lang={lang}
                setLang={setLang}
              />
            } />

            <Route path="/coach" element={
              <AICoachPage
                profile={profile}
                interpretation={interpretation}
                onNavigateToUpgrade={() => navigate('/paywall')}
                lang={lang}
                theme="light"
              />
            } />

            <Route path="/insights" element={
              <InsightsPage
                transactions={transactions}
                profile={profile}
                onNavigateToUpgrade={() => navigate('/paywall')}
                lang={lang}
                theme="light"
              />
            } />

            <Route path="/alerts" element={
              <AlertsPage />
            } />

            <Route path="/simulation" element={
              <GoalSimulationPage
                profile={profile}
                goals={goals}
                onNavigateToUpgrade={() => navigate('/paywall')}
                lang={lang}
                theme="light"
              />
            } />

            <Route path="/budget" element={
              <BudgetManagementPage
                transactions={transactions}
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                lang={lang}
                theme="light"
                goals={goals}
              />
            } />

            <Route path="/coachHistory" element={
              <AICoachHistoryPage
                profile={profile}
                lang={lang}
                theme="light"
              />
            } />

            <Route path="/more" element={
              <MorePage
                profile={profile}
                transactions={transactions}
                onUpdateProfile={handleUpdateProfile}
                onLogout={handleLogout}
                lang={lang}
                setLang={setLang}
                onNavigateToSection={(section: string) => navigate(`/${section}`)}
              />
            } />

            <Route path="/paywall" element={
              <PaywallPage
                profile={profile}
                onUpgradeComplete={handleUpgradeComplete}
                onClose={() => navigate('/dashboard')}
                lang={lang}
                theme="light"
              />
            } />

            <Route path="/notifications" element={
              <Navigate to="/dashboard" replace />
            } />

            {/* Legal / compliance */}
            <Route path="/privacy" element={
              <LegalDocsPage doc="privacy" onBack={() => navigate(-1)} lang={lang} />
            } />
            <Route path="/terms" element={
              <LegalDocsPage doc="terms" onBack={() => navigate(-1)} lang={lang} />
            } />

            <Route path="/balance" element={
              <Navigate to="/dashboard" replace />
            } />

            {/* Catch-all: unknown routes go to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom Navigation - Global Navigation */}
      <FloatingBottomNav lang={lang} currentTab={location.pathname.slice(1)} onNavigate={(tab) => navigate(`/${tab}`)} />

      {/* PDPA consent (Compliance) */}
      {!consent && (
        <PdpaConsentBanner lang={lang} onAccept={() => setConsent(loadConsent())} />
      )}

      {/* App Lock gate (Platform & Access) — above everything incl. nav */}
      {auth.user && appLocked && (
        <AppLockOverlay
          lang={lang}
          onUnlock={() => { markUnlocked(); setAppLocked(false); }}
          onSignOut={async () => { await handleLogout(); setAppLocked(isLockEnabled() && !isSessionUnlocked()); }}
        />
      )}

      </AlertsProvider>
    </div>
  );
}
