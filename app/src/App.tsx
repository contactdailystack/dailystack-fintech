import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard, BrainCircuit, BarChart3, Settings, Crown, Star, Activity,
  X, Sliders, Sparkles, Target, Ruler, Zap, Microscope, Smartphone, Gem, Target as TargetIcon, CreditCard,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// DailyStack Translations
import { translations, Language } from './data/translations';

// Auth + Tier + FBIS
import { AuthProvider, useAuthContext } from './services/AuthContext';
import { updateUserTier } from './services/userTierService';
import type { SubscriptionTier } from './services/userTierService';

// DailyStack sub-pages imports — code-split with React.lazy
const AuthPage              = lazy(() => import('./components/AuthPage'));
const AuthCallbackPage      = lazy(() => import('./components/AuthCallbackPage'));
const OnboardingPage         = lazy(() => import('./components/OnboardingPage'));
const DashboardPage          = lazy(() => import('./components/DashboardPage'));
const ActivityPage           = lazy(() => import('./components/ActivityPage'));
const InsightsPage           = lazy(() => import('./components/InsightsPage'));
const PaywallPage            = lazy(() => import('./components/PaywallPage'));
const AICoachPage            = lazy(() => import('./components/AICoachPage'));
const ProfileSettingsPage    = lazy(() => import('./components/ProfileSettingsPage'));
const WeeklyStoryPage        = lazy(() => import('./components/WeeklyStoryPage'));
const DatabasePage           = lazy(() => import('./components/DatabasePage'));
const MorePage               = lazy(() => import('./components/MorePage'));
const FinancialEvolutionPage = lazy(() => import('./components/FinancialEvolutionPage'));
const AlternativeAssetsPage  = lazy(() => import('./components/AlternativeAssetsPage'));
const SubscriptionTrackerPage= lazy(() => import('./components/SubscriptionTrackerPage'));
const AICoachHistoryPage     = lazy(() => import('./components/AICoachHistoryPage'));
const BudgetManagementPage   = lazy(() => import('./components/BudgetManagementPage'));
const GoalSimulationPage     = lazy(() => import('./components/GoalSimulationPage'));
const MoneyTwinPage          = lazy(() => import('./components/MoneyTwinPage'));

// Wallet + FBIS
import { getOrCreateWallet } from './services/walletService';
import { getOrInitFBIS } from './services/fbisService';
import type { FBISMetaRecord } from './services/fbisService';

// State Simulation and Design wireframes metadata
import { StateSimulatorWrapper } from './components/StateSimulatorWrapper';
import { WIREFRAME_METADATA } from './data/wireframeMetadata';

// Types & Preset Mock Data
import { UserProfile, StockAsset, Transaction } from './types';
import { 
  INITIAL_PROFILE, 
  INITIAL_STOCKS, 
  INITIAL_TRANSACTIONS, 
  MOCK_INTERPRETATION,
  WEEKLY_STORIES
} from './data/mockFintechData';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPageWrapper />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </AuthProvider>
  );
}

function AuthCallbackPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0C0D0E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#C7FF2E] border-t-transparent" />
        </div>
      </div>
    }>
      <AuthCallbackPage />
    </Suspense>
  );
}

function AppShell() {
  const auth = useAuthContext();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'activity' | 'radar' | 'insights' | 'database' | 'stories' | 'settings' | 'paywall' | 'more' | 'evolution' | 'alternative' | 'simulation' | 'budget' | 'coachHistory' | 'subscriptions' | 'moneyTwin'>('dashboard');

  const [simulatedState, setSimulatedState] = useState<'normal' | 'empty' | 'loading' | 'error' | 'success'>('normal');
  const [showBlueprintDrawer, setShowBlueprintDrawer] = useState(false);
  const [blueprintActiveTab, setBlueprintActiveTab] = useState<'intent' | 'structure' | 'ai' | 'states' | 'adapt'>('intent');

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('dslang') as Language) || 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.style.backgroundColor = 'var(--color-dark-bg)';
  }, []);

  useEffect(() => {
    localStorage.setItem('dslang', lang);
  }, [lang]);

  // Core application database state
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...INITIAL_PROFILE,
    plan: auth.tier,
    email: auth.user?.email || INITIAL_PROFILE.email,
    name: auth.profileName || INITIAL_PROFILE.name,
  }));
  const [stocks] = useState<StockAsset[]>(INITIAL_STOCKS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [fbis, setFbis] = useState<FBISMetaRecord | null>(null);

  // Load real wallet + FBIS data from Supabase on mount
  useEffect(() => {
    if (!auth.user) return;

    const loadRealtimeData = async () => {
      const [wallet, fbisData] = await Promise.all([
        getOrCreateWallet(),
        getOrInitFBIS(),
      ]);

      setProfile(prev => ({
        ...prev,
        balance: wallet.balance,
        portfolioValue: wallet.balance, // portfolio tied to wallet for now
      }));
      setFbis(fbisData);
    };

    loadRealtimeData();
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
  
    const handleUpdateProfile = async (updatedFields: Partial<UserProfile>) => {
      // Update local state
      setProfile(prev => ({ ...prev, ...updatedFields }));
      
      // Persist display_name to Supabase users table if provided
      if (updatedFields.name) {
        const { updateUserDisplayName } = await import('./services/userTierService');
        await updateUserDisplayName(updatedFields.name);
      }
    };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleUpgradeComplete = async (newTier: SubscriptionTier) => {
    await updateUserTier(newTier);
    // Re-fetch profile after tier update — onAuthStateChange will pick it up
  };

  const handleLogout = async () => {
    await auth.logout();
    setOnboardingDone(false);
    setCurrentSection('dashboard');
    setProfile(INITIAL_PROFILE);
    setTransactions(INITIAL_TRANSACTIONS);
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0D0E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#C7FF2E] border-t-transparent" />
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Loading DailyStack...</span>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <AuthPage
        onLoginSuccess={() => {}}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  // 2. Onboarding Gate
  if (!onboardingDone) {
    return (
      <OnboardingPage 
        onComplete={() => setOnboardingDone(true)} 
        lang={lang} 
        setLang={setLang} 
      />
    );
  }

  const t = translations[lang];

  return (
    <div id="dailystack-root-viewport" className="min-h-screen flex flex-col justify-between selection:bg-brand/45 selection:text-black transition-colors duration-400 bg-dark-bg text-slate-100 relative overflow-x-hidden">
      
      {/* Dynamic top safety navigation menu (Apple Wallet & Mercury styling) */}
      <header id="global-luxury-header" className="sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3.5 flex items-center justify-between transition-colors duration-300 bg-dark-bg/80 border-slate-800/80 text-slate-100">
        <div className="flex items-center gap-2.5" id="header-brand-wrap">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-brand-muted flex items-center justify-center text-black font-display font-black text-xs shadow-md pilo-glow-sm">
            PW
          </div>
          <div>
            <h1 className="font-display font-extrabold text-sm tracking-tight text-slate-100">{t.brand}</h1>
            <p className="text-[9px] font-mono text-brand dark:text-brand uppercase tracking-widest leading-none bg-zinc-900 dark:bg-transparent px-1.5 py-0.5 rounded sm:px-0 sm:py-0">{t.subtitle}</p>
          </div>
        </div>

        {/* Dynamic active account detail trigger */}
        <div className="flex items-center gap-4" id="header-profile-wrap">
          
          {/* Quick Language Toggle */}
          <button
            id="h-lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border font-mono font-bold text-[9px] tracking-wider transition-all cursor-pointer uppercase bg-dark-card border-zinc-800 text-brand hover:bg-zinc-800"
            title="Switch Language / สลับภาษา"
          >
            {lang === 'en' ? 'EN' : 'TH'}
          </button>

          {auth.tier === 'basic' ? (
            <button
              id="h-upgrade-paywall-trigger"
              onClick={() => setCurrentSection('paywall')}
              className="bg-brand text-black font-display font-black text-[10px] px-3.5 py-1.5 rounded-xl uppercase tracking-wider hover:bg-brand-muted hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-md pilo-glow-sm"
            >
              <Crown className="w-3 h-3 text-black fill-black" /> {t.getPremium}
            </button>
          ) : (
            <div className="border px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-dark-card border-emerald-500/20" id="active-luxury-banner">
              <Star className="w-3 h-3 text-brand fill-brand" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">{t.sovereignVerified}</span>
            </div>
          )}

          {/* User profile capsule bubble */}
          <button
            id="h-profile-tab-shortcut"
            onClick={() => setCurrentSection('settings')}
            className="flex items-center gap-2.5 border px-3 py-1.5 rounded-full transition-colors cursor-pointer bg-dark-card border-zinc-800 hover:border-zinc-700"
          >
            <img 
              src={/^https?:\/\//.test(profile.avatarUrl) ? profile.avatarUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`} 
              alt="Avatar" 
              className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-700" 
            />
            <span className="font-display font-medium text-xs hidden sm:inline text-zinc-300">
              {profile.name}
            </span>
          </button>
        </div>
      </header>

      {/* Main interactive layout routing block */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8" id="dailystack-workspace">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            id="viewport-route-holder"
          >
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#C7FF2E] border-t-transparent animate-spin" />
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Loading module...</span>
                </div>
              </div>
            }>
            <StateSimulatorWrapper 
              state={simulatedState} 
              onReset={() => setSimulatedState('normal')} 
              screenId={currentSection} 
              lang={lang}
            >
              {currentSection === 'dashboard' && (
                <DashboardPage 
                  profile={profile} 
                  stocks={stocks} 
                  transactions={transactions} 
                  onUpdateProfile={handleUpdateProfile} 
                  onAddTransaction={handleAddTransaction}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'activity' && (
                <ActivityPage 
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  lang={lang}
                />
              )}

              {currentSection === 'radar' && (
                <AICoachPage 
                  profile={profile}
                  interpretation={MOCK_INTERPRETATION}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'insights' && (
                <InsightsPage 
                  transactions={transactions}
                  profile={profile}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'database' && (
                <DatabasePage 
                  transactions={transactions}
                  profile={profile}
                  lang={lang}
                />
              )}

              {currentSection === 'stories' && (
                <WeeklyStoryPage
                  stories={WEEKLY_STORIES}
                  profile={profile}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'evolution' && (
                <FinancialEvolutionPage
                  profile={profile}
                  lang={lang}
                  fbis={fbis}
                />
              )}

              {currentSection === 'alternative' && (
                <AlternativeAssetsPage
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                />
              )}

              {currentSection === 'subscriptions' && (
                <SubscriptionTrackerPage
                  lang={lang}
                  theme="dark"
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                />
              )}

              {currentSection === 'moneyTwin' && (
                <MoneyTwinPage
                  profile={profile}
                  transactions={transactions}
                  fbis={fbis}
                  interpretation={MOCK_INTERPRETATION}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'simulation' && (
                <GoalSimulationPage
                  profile={profile}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'budget' && (
                <BudgetManagementPage
                  transactions={transactions}
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'coachHistory' && (
                <AICoachHistoryPage
                  profile={profile}
                  lang={lang}
                  theme="dark"
                />
              )}

              {currentSection === 'settings' && (
                <ProfileSettingsPage 
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                  onNavigateToUpgrade={() => setCurrentSection('paywall')}
                  lang={lang}
                  setLang={setLang}
                />
              )}

              {currentSection === 'more' && (
                <MorePage 
                  profile={profile}
                  transactions={transactions}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                  lang={lang}
                  setLang={setLang}
                  onNavigateToSection={(section: 'dashboard' | 'activity' | 'radar' | 'insights' | 'database' | 'stories' | 'settings' | 'paywall' | 'more' | 'evolution' | 'alternative' | 'simulation' | 'budget' | 'coachHistory' | 'subscriptions' | 'moneyTwin') => setCurrentSection(section)}
                />
              )}

              {currentSection === 'paywall' && (
                <PaywallPage 
                  profile={profile}
                  onUpgradeComplete={handleUpgradeComplete}
                  onClose={() => setCurrentSection('dashboard')}
                  lang={lang}
                  theme="dark"
                />
              )}
            </StateSimulatorWrapper>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Futuristic Floating Bottom Navigation bar (Monzo/Copilot design style) */}
      <nav id="floating-luxury-navigation" className="sticky bottom-6 z-40 mx-auto max-w-lg w-[92%] border rounded-[24px] p-2 flex justify-between items-center shadow-[0_12px_36px_rgba(0,0,0,0.08)] backdrop-blur-xl mb-4 transition-all duration-300 bg-dark-card/95 border-dark-border shadow-black/80">
        <button
          id="btn-nav-dashboard"
          onClick={() => setCurrentSection('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'dashboard'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Home' : 'หน้าหลัก'}
          </span>
        </button>

        <button
          id="btn-nav-activity"
          onClick={() => setCurrentSection('activity')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'activity'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Activity' : 'บันทึกสติ'}
          </span>
        </button>

        <button
          id="btn-nav-insights"
          onClick={() => setCurrentSection('insights')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'insights'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Insights' : 'ข้อมูลเชิงลึก'}
          </span>
        </button>

        <button
          id="btn-nav-evolution"
          onClick={() => setCurrentSection('evolution')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'evolution'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Evolution' : 'วิวัฒนาการ'}
          </span>
        </button>

        <button
          id="btn-nav-money-twin"
          onClick={() => setCurrentSection('moneyTwin')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'moneyTwin'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Twin' : 'Twin'}
          </span>
        </button>

        <button
          id="btn-nav-budget"
          onClick={() => setCurrentSection('budget')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'budget'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Budget' : 'งบ'}
          </span>
        </button>

        <button
          id="btn-nav-alternative"
          onClick={() => setCurrentSection('alternative')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'alternative'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Gem className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Vault' : 'ตู้นิรภัย'}
          </span>
        </button>

        <button
          id="btn-nav-subscriptions"
          onClick={() => setCurrentSection('subscriptions')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'subscriptions'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'Subs' : 'สมัคร'}
          </span>
        </button>

        <button
          id="btn-nav-radar"
          onClick={() => setCurrentSection('radar')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'radar'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'AI Coach' : 'โค้ชประคบ'}
          </span>
        </button>

        <button
          id="btn-nav-more"
          onClick={() => setCurrentSection('more')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            currentSection === 'more' || currentSection === 'settings' || currentSection === 'database'
              ? 'text-brand bg-dark-card'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
            {lang === 'en' ? 'More' : 'เมนูเพิ่มเติม'}
          </span>
        </button>
      </nav>

      {/* 4. Interactive UX Wireframe Design System Overlay & Simulator Cockpit */}
      {/* Floating Spark launcher Badge */}
      <div className="fixed bottom-6 right-6 z-40" id="blueprint-floating-trigger">
        <button
          id="btn-blueprint-trigger"
          onClick={() => setShowBlueprintDrawer(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full font-mono text-[10px] bg-brand text-black hover:scale-105 active:scale-95 duration-200 shadow-lg pilo-glow-sm uppercase cursor-pointer font-black"
        >
          <Sliders className="w-3.5 h-3.5 text-black animate-spin-slow" />
          <span>{lang === 'en' ? "Blueprint OS" : "วิเคราะห์พิมพ์เขียว UX"}</span>
        </button>
      </div>

      {/* Slide-over Blueprint drawer */}
      <AnimatePresence>
        {showBlueprintDrawer && (
          <>
            {/* Backdrop shadow screen mask */}
            <motion.div
              id="blueprint-backdrop-mask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlueprintDrawer(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 cursor-pointer"
            />

            {/* Main Interactive sliding drawer panel */}
            <motion.div
              id="blueprint-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-dark-bg border-l border-zinc-900 shadow-2xl z-50 flex flex-col justify-between text-left"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" id="blueprint-drawer-scroller">
                
                {/* Header capsule details */}
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4" id="blueprint-drawer-header">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-brand font-mono text-[9px] font-bold tracking-widest uppercase">
                      <Sparkles className="w-3 h-3 animate-pulse" /> PicksWise Design System V5.3
                    </span>
                    <h3 className="text-white font-display font-black text-xl uppercase tracking-tight">
                      {lang === 'en' ? "Wireframe Inspector" : "ชำแหละโครงสร้างฟลูอิด"}
                    </h3>
                  </div>
                  <button
                    id="btn-close-blueprint"
                    onClick={() => setShowBlueprintDrawer(false)}
                    className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-850 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ACTIVE VIEW SPECIFICATION DETAILS */}
                <div className="space-y-3" id="active-wireframe-info">
                  <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                    <span>{lang === 'en' ? "ACTIVE WORKSPACE" : "หน้าจอจำลองงานปัจจุบัน"}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-brand">
                      SECTION: {currentSection.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 text-left">
                    <h1 className="font-display font-black text-sm text-white uppercase tracking-tight">
                      {lang === 'en' 
                        ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).nameEn 
                        : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).nameTh}
                    </h1>
                  </div>
                </div>

                {/* INTERACTIVE MOCK STATE SIMULATOR MODULE */}
                <div className="p-4 rounded-[24px] bg-gradient-to-b from-zinc-950 to-zinc-900/40 border border-zinc-900 space-y-4" id="wireframe-simulator-cockpit">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Sliders className="w-3 h-3 text-brand" />
                    <span>{lang === 'en' ? "Interactive State Simulator" : "แผงควบคุมสลับขั้วสถานะจำลอง ปลอดภัย"}</span>
                  </div>

                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                    {lang === 'en' 
                      ? "Toggle the design environment rules below to instantly render mock empty, loading, error, or success layouts in the active screen."
                      : "คลิกปุ่มด้านล่างเพื่อสับเปลี่ยนกระดานไปสู่มุมมองโครงสร้างว่างเปล่า, กำลังโหลดวิญญาณ, เผชิญค่าสัญญาณคลาดเคลื่อน หรืออนุมัติกลยุทธ์สำเร็จ"}
                  </p>

                  {/* Simulator option triggers */}
                  <div className="grid grid-cols-2 gap-2" id="simulator-selection-grid">
                    {([
                      { stateId: 'normal' as const, labelEn: "Normal OS", labelTh: "กระเป๋าปกติ" },
                      { stateId: 'empty' as const, labelEn: "Empty Orb", labelTh: "โหนดไม่มีเงิน" },
                      { stateId: 'loading' as const, labelEn: "Loading Skel", labelTh: "โหมดกำลังโหลด" },
                      { stateId: 'error' as const, labelEn: "Error Shield", labelTh: "สัญญาณขัดข้อง" },
                      { stateId: 'success' as const, labelEn: "Success Stamp", labelTh: "ประความสำเร็จ" }
                    ] as const).map(item => (
                      <button
                        id={`btn-sim-${item.stateId}`}
                        key={item.stateId}
                        onClick={() => {
                          setSimulatedState(item.stateId);
                          // Automatic hint notification
                        }}
                        className={`px-3 py-2.5 rounded-xl border font-mono text-[10px] uppercase tracking-wider text-center cursor-pointer transition-all ${
                          simulatedState === item.stateId
                            ? "bg-brand text-black border-brand font-bold"
                            : "bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900"
                        } ${item.stateId === 'normal' ? 'col-span-2' : ''}`}
                      >
                        {lang === 'en' ? item.labelEn : item.labelTh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* THE 20 UX WIREFRAME DELIVERABLES TABBED PANEL */}
                <div className="space-y-3" id="diagnostics-deliverables-folder">
                  <div className="flex border-b border-zinc-900 overflow-x-auto pb-1" id="blueprint-tabs-bar">
                    {([
                      { tabId: 'intent' as const, labelEn: "INTENT", labelTh: "เป้าหมาย", icon: Target },
                      { tabId: 'structure' as const, labelEn: "FORM", labelTh: "โครงกริด", icon: Ruler },
                      { tabId: 'ai' as const, labelEn: "CORE ACTION", labelTh: "แผนอัจฉริยะ", icon: Zap },
                      { tabId: 'states' as const, labelEn: "STATES", labelTh: "สถานะเล็ง", icon: Microscope },
                      { tabId: 'adapt' as const, labelEn: "SCALE", labelTh: "ความสวิตช์", icon: Smartphone }
                    ] as const).map(btn => (
                      <button
                        id={`btn-tab-${btn.tabId}`}
                        key={btn.tabId}
                        onClick={() => setBlueprintActiveTab(btn.tabId)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all border-b-2 leading-none uppercase ${
                          blueprintActiveTab === btn.tabId
                            ? "border-brand text-white font-bold"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <btn.icon className="w-3.5 h-3.5" />
                        {lang === 'en' ? btn.labelEn : btn.labelTh}
                      </button>
                    ))}
                  </div>

                  {/* Render Tab Contents based on active design category */}
                  <div className="space-y-4 pt-2 text-left" id="blueprint-deliverables-output">
                    
                    {blueprintActiveTab === 'intent' && (
                      <>
                        <div id="spec-scr-objective" className="space-y-1 animate-slide-up-step">
                          <span className="text-[9px] font-mono text-brand uppercase tracking-widest font-black block">1. Screen Objective</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.screenObjective.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.screenObjective.th}
                          </p>
                        </div>

                        <div id="spec-biz-objective" className="space-y-1 animate-slide-up-step">
                          <span className="text-[9px] font-mono text-brand uppercase tracking-widest font-black block">2. Business Objective</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.businessObjective.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.businessObjective.th}
                          </p>
                        </div>

                        <div id="spec-usr-objective" className="space-y-1 animate-slide-up-step">
                          <span className="text-[9px] font-mono text-brand uppercase tracking-widest font-black block">3. User Objective</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.userObjective.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.userObjective.th}
                          </p>
                        </div>

                        <div id="spec-usr-psych" className="space-y-1">
                          <span className="text-[9px] font-mono text-brand uppercase tracking-widest font-black block">4. User Psychology</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.userPsychology.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.userPsychology.th}
                          </p>
                        </div>
                      </>
                    )}

                    {blueprintActiveTab === 'structure' && (
                      <>
                        <div id="spec-ia" className="space-y-1">
                          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black block">5. Information Architecture</span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-mono text-[11px] bg-black/40 p-3 rounded-xl border border-zinc-900">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.informationArchitecture.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.informationArchitecture.th}
                          </p>
                        </div>

                        <div id="spec-layout-structure" className="space-y-1">
                          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black block">6. Layout Structure</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.layoutStructure.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.layoutStructure.th}
                          </p>
                        </div>

                        <div id="spec-components-hierarchy" className="space-y-1">
                          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black block">7. Component Hierarchy</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.componentHierarchy.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.componentHierarchy.th}
                          </p>
                        </div>
                      </>
                    )}

                    {blueprintActiveTab === 'ai' && (
                      <>
                        <div id="spec-ai-ops" className="space-y-1">
                          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-black block">8. AI Opportunities (Coach Brain)</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.aiOpportunities.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.aiOpportunities.th}
                          </p>
                        </div>

                        <div id="spec-monetization" className="space-y-1">
                          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-black block">9. Monetization Opportunities (Upgrades)</span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans italic">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.monetizationOpportunities.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.monetizationOpportunities.th}
                          </p>
                        </div>

                        <div id="spec-behavioral" className="space-y-1">
                          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-black block">10. Behavioral Opportunities (Habits)</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.behavioralOpportunities.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.behavioralOpportunities.th}
                          </p>
                        </div>
                      </>
                    )}

                    {blueprintActiveTab === 'states' && (
                      <>
                        <div id="spec-empty" className="space-y-1">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-black block">11. Empty State (Zero-Balance)</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.emptyState.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.emptyState.th}
                          </p>
                        </div>

                        <div id="spec-loading" className="space-y-1">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-black block">12. Loading State (Shimmer skeleton)</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.loadingState.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.loadingState.th}
                          </p>
                        </div>

                        <div id="spec-error" className="space-y-1">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-black block">13. Error Boundary (Protected Recovery)</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.errorState.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.errorState.th}
                          </p>
                        </div>

                        <div id="spec-success" className="space-y-1">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-black block">14. Success / Confirmation state</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.successState.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.successState.th}
                          </p>
                        </div>
                      </>
                    )}

                    {blueprintActiveTab === 'adapt' && (
                      <>
                        <div id="spec-mobile" className="space-y-1">
                          <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">15. Mobile Wireframe adaptation</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.mobileWireframe.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.mobileWireframe.th}
                          </p>
                        </div>

                        <div id="spec-tablet" className="space-y-1">
                          <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">16. Tablet Wireframe Adaptation</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.tabletAdaptation.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.tabletAdaptation.th}
                          </p>
                        </div>

                        <div id="spec-access" className="space-y-1">
                          <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">17. Accessibility Notes (Contrast/ARIA)</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.accessibilityNotes.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.accessibilityNotes.th}
                          </p>
                        </div>

                        <div id="spec-kpis" className="space-y-1">
                          <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">18. KPI Impact matrix</span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans font-bold">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.kpiImpact.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.kpiImpact.th}
                          </p>
                        </div>

                        <div id="spec-fbis" className="space-y-1">
                          <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">19. FBIS Behavior Impact Value</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.fbisImpact.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.fbisImpact.th}
                          </p>
                        </div>

                        <div id="spec-upgrade-impact" className="space-y-1">
                          <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">20. Upgrade / Conversion Rate metrics</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {lang === 'en' 
                              ? (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.upgradeImpact.en 
                              : (WIREFRAME_METADATA[currentSection] || WIREFRAME_METADATA['dashboard']).specs.upgradeImpact.th}
                          </p>
                        </div>
                      </>
                    )}

                  </div>
                </div>

              </div>

              {/* Lower footer button in side panel */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-900" id="blueprint-drawer-footer">
                <button
                  id="btn-blueprint-drawer-close-lower"
                  onClick={() => setShowBlueprintDrawer(false)}
                  className="w-full font-mono font-bold text-[10px] py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-all uppercase hover:bg-zinc-900 cursor-pointer text-center block"
                >
                  {lang === 'en' ? "Close Blueprint Drawer" : "ปิดแถบวิเคราะห์พฤติกรรม"}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Compliance footprint footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 pb-6 text-center text-[10px] font-mono flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-350 text-zinc-500" id="dailystack-footer">
        <div className="flex items-center gap-2">
          <span>PICKSWISE SYSTEMS INC. © 2026</span>
          <span className="text-zinc-500 dark:text-zinc-800">|</span>
          <span className="text-[9px] px-2 py-0.5 rounded border text-brand bg-brand/5 border-brand/10">
            ENCRYPTED DECISION ENGINES LOADED
          </span>
        </div>
        <p className="text-[9px] font-sans">
          Engineered for fluid behavioral layouts and daily financial clarity.
          PicksWise OS framework active.
        </p>
      </footer>
    </div>
  );
}
