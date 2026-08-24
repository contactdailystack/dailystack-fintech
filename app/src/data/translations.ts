export type Language = 'en' | 'th';

export interface TranslationDict {
  // Common UI Elements
  brand: string;
  subtitle: string;
  reserveVault: string;
  portfolioTitle: string;
  totalPortfolio: string;
  growthLabel: string;
  assetPerformance: string;
  liveFeed: string;
  sparksLabel: string;
  recentLedger: string;
  ledgerSub: string;
  searchPlaceholder: string;
  noRecords: string;
  coreBalance: string;
  deposit: string;
  withdraw: string;
  transfer: string;
  getPremium: string;
  sovereignVerified: string;
  legalName: string;
  commsRoute: string;
  terminateSession: string;
  commitSpecs: string;
  premiumOS: string;
  coreLevel: string;
  currentOperationalTier: string;
  currentOperationalTierDesc: string;
  freeTierPitch: string;
  activateLuxury: string;
  secureEncryptionTitle: string;
  secureEncryptionPitch: string;
  yearsOfAutonomousCapital: string;

  // Onboarding Screen
  introductionSkip: string;
  moduleLabel: string;
  luxurySystem: string;
  moneyPulse: { title: string; subtitle: string; desc: string };
  ghostHunt: { title: string; subtitle: string; desc: string };
  storyBegins: { title: string; subtitle: string; desc: string };
  guardianReady: { title: string; subtitle: string; desc: string };
  readyLaunch: { title: string; subtitle: string; desc: string };
  immediateImpact: string;
  averageWeeklySavings: string;
  reducedRegret: string;
  pathFreedom: string;
  launchOS: string;
  commitmentTitle: string;
  commitmentSubtitle: string;
  commitmentStatement: string;
  commitmentConfirm: string;
  commitmentDecline: string;
  nextStep: string;
  financialChallenge: {
    question: string;
    options: { title: string; subtitle: string }[];
  };
  onboardingSteps: {
    title: string;
    desc: string;
    statsVal: string;
    statsLabel: string;
    type?: string;
    }[];

  // Auth Screen
  secureFinOS: string;
  loginSub: string;
  emailId: string;
  authSuccess: { title: string; subtitle: string };
  
  // OTP Screen
  otpTitle: string;
  otpSubtitle: string;
  otpEnterCode: string;
  otpVerifyBtn: string;
  otpResendQuestion: string;
  otpResendIn: string;
  otpResend: string;
  otpBack: string;
  otpSuccessTitle: string;
  otpSuccessVerify: string;
  otpSuccessReset: string;
  otpSuccessVerifySub: string;
  otpSuccessResetSub: string;
  otpContinueBtn: string;
  otpResetPasswordBtn: string;
  otpSecureVerification: string;
  otpInvalidError: string;
  otpFailedError: string;
  otpResendError: string;
  password: string;
  forgot: string;
  enterOS: string;
  initAccount: string;
  orMaster: string;
  appleCard: string;
  googleCloud: string;
  alreadyEngineered: string;
  newToDailyStack: string;
  loginCore: string;
  registerSecurely: string;
  bankSecured: string;

  // Base Currency Selection
  baseCurrencyTitle: string;
  baseCurrencySub: string;
  baseCurrencySelect: string;
  baseCurrencyConfirm: string;
  baseCurrencyTHB: string;
  baseCurrencyUsd: string;
  baseCurrencyEur: string;
  baseCurrencyGbp: string;
  baseCurrencyJpy: string;
  baseCurrencySgd: string;

  // AI Coach / Radar Screen
  identityRadar: string;
  coreSignature: string;
  confidenceScore: string;
  biometricIndicators: string;
  calibrationsTitle: string;
  impulseRating: string;
  futureHorizon: string;
  socialDefense: string;
  valueSeeking: string;
  tacticalEngine: string;
  readyReasoning: string;
  infiniteMemory: string;
  chatPlaceholder: string;
  chatProcessing: string;

  // Insights / Analytics Screen
  valueInsightsTitle: string;
  valueInsightsSub: string;
  spendCalculation: string;
  spendSub: string;
  categoryDensity: string;
  radarRevelation: string;
  dopamineOutflows: string;
  impulseDecreasedText: string;
  topRegulatedClass: string;
  deepCoreTitle: string;
  deepCoreSub: string;
  upgradeFutureOS: string;

  // Stock Detail Modal
  assetAnalysis: string;
  unitSharePrice: string;
  percentageMetric: string;
  chartFluctuations: string;
  sellPosition: string;
  acquireShares: string;
  simulatedSell: string;
  simulatedBuy: string;

  // Vault Modals
  inboundVault: string;
  outboundVault: string;
  externalWallet: string;
  recipientRouting: string;
  transactionCost: string;
  actionAmountError: string;
  withdrawError: string;
  transferError: string;
  transferRecipientError: string;
  depositSuccess: string;
  withdrawSuccess: string;
  transferSuccess: string;
  executeProtocol: string;
  quickActionPrompt: string;

    // Alternative Assets
    alternativeVaultTitle: string;
    alternativeVaultSub: string;
    alternativeAddAsset: string;
    alternativeEditAsset: string;
    alternativeDeleteAsset: string;
    alternativeTotalValue: string;
    alternativeTotalPL: string;
    alternativeAvgReturn: string;
    alternativeNoAssets: string;
    alternativeLocked: string;
    alternativeLockedDesc: string;

    // Budget Management Page
    budgetTitle: string;
    budgetSub: string;
    budgetOverviewTab: string;
    budgetCategoriesTab: string;
    budgetGoalsTab: string;
    budgetTotalBudget: string;
    budgetSpent: string;
    budgetLeft: string;
    budgetDaysLeft: string;
    budgetAvgDay: string;
    budgetProjected: string;
    budgetOverBudget: string;
    budgetNearLimit: string;
    budgetMonthlyTrend: string;
    budgetAIRecommendation: string;
    budgetSetCoolRule: string;
    budgetAddCategory: string;
    budgetEditCategory: string;
    budgetCategoryName: string;
    budgetMonthlyLimit: string;
    budgetSave: string;
    budgetCancel: string;
    budgetDeleteCategory: string;
    budgetDeleteConfirm: string;
    budgetProgressBar: string;
    budgetOverBudgetAlert: string;
    budgetAddFirstBudget: string;
    budgetNoCategories: string;
    budgetUnlockElite: string;
    budgetEliteFeature: string;
    budgetCreateFirst: string;
    budgetAllGoals: string;

    // Goal Simulation Page
    goalSimulationTitle: string;
    goalSimulationSub: string;
    goalSimulationGoalsTab: string;
    goalSimulationSimulationTab: string;
    goalSimulationUnlockElite: string;
    goalSimulationTargetDate: string;
    goalSimulationRemaining: string;
    goalSimulationSaved: string;
    goalSimulationTarget: string;
    goalSimulationMonths: string;
    goalSimulationAIRecommendation: string;
    goalSimulationScenario: string;
    goalSimulationModerateGrowth: string;
    goalSimulationAggressiveSave: string;
    goalSimulationRelaxedPace: string;
    goalSimulationMonthlyContribution: string;
    goalSimulationProjectedTimeline: string;
    goalSimulation24Months: string;
    goalSimulationRun: string;
    goalSimulationSimulating: string;
    goalSimulationProjectedValue: string;
    goalSimulationTimeToGoal: string;
    goalSimulationAIInsight: string;
    goalSimulationUnlockAdvanced: string;
    goalSimulationUnlockAdvancedDesc: string;
    goalSimulationUpgradeElite: string;
    goalSimulationComplete: string;
    goalSimulationNow: string;
    goalSimulationReturn: string;

    netWorthHeroLabel: string;
    netWorthPositiveChange: string;
    netWorthNegativeChange: string;
    assetBreakdownTitle: string;
    quickAddPlaceholder: string;
    aiCategorySuggestion: string;
    underBudgetProgress: string;
    overBudgetProgress: string;
    subscriptionWarning3Days: string;
    adaptiveFABMessage: string;

    // PaywallPage
    paywallHeading: string;
    paywallSubheading: string;
    paywallTogglePro: string;
    paywallToggleElite: string;
    paywallPerYear: string;
    paywallPerMonth: string;
    paywallSubscribe: string;
    paywallAutoRenew: string;
    paywallWelcome: string;
    paywallSuccessText: string;
    paywallGetStarted: string;
    paywallFeatures: string;
    paywallFree: string;
    paywallLoading: string;
    paywallScanQr: string;
    paywallScanQrHint: string;
    paywallWaitingPayment: string;
    paywallQrExpiresIn: string;
    paywallPaymentFailed: string;
    paywallBack: string;
    paywallQrExpired: string;
    paywallTryAgain: string;

    // Subscription Shadow Page
    subscriptionShadowTitle: string;
    subscriptionShadowSubtitle: string;
    subShadowAddBtn: string;
    subShadowMonthly: string;
    subShadowTotalRecurring: string;
    subShadowYearly: string;
    subShadowProjectedAnnual: string;
    subShadowThisWeek: string;
    subShadowCharges: string;
    subShadowActiveCount: string;
    subShadowActiveLabel: string;
    subShadowAllFilter: string;
    subShadowPausedFilter: string;
    subShadowCancelledFilter: string;
    subShadowSortLabel: string;
    subShadowSortNextBilling: string;
    subShadowSortAmount: string;
    subShadowSortName: string;
    subShadowNoSubs: string;
    subShadowNoSubsDesc: string;
    subShadowAddFirst: string;
    subShadowDueToday: string;
    subShadowTomorrow: string;
    subShadowDays: string;
    subShadowNextBillingDate: string;
    subShadowLastUsed: string;
    subShadowFrequency: string;
    subShadowAnnualCost: string;
    subShadowCancelBtn: string;
    subShadowReactivateBtn: string;
    subShadowDeleteBtn: string;
    subShadowCategoryBreakdown: string;
    subShadowUpcomingCharges: string;
    subShadowNoChargesThisWeek: string;
    subShadowAiInsightTitle: string;
    subShadowSavingsPotential: string;
    subShadowAddModalTitle: string;
    subShadowAddModalDesc: string;
    subShadowServiceName: string;
    subShadowBillingCycle: string;
    subShadowCategory: string;
    subShadowNextBillingOptional: string;
    subShadowCalendarTab: string;
    subShadowListTab: string;
    subShadowConciergeTitle: string;
    subShadowConciergeDesc: string;
    subShadowConciergeBtn: string;
    subShadowCancelPhone: string;
    subShadowCancelEmail: string;
    subShadowCancelWeb: string;
    subShadowViewCancelInstructions: string;
    subShadowUpcomingTab: string;
    subShadowAllTab: string;
    subShadowComingUpCardTitle: string;
    subShadowLeftToPay: string;
    subShadowActiveSubscriptions: string;
    subShadowPredictiveAmount: string;
    subShadowSkipThisMonth: string;
    subShadowEditAmount: string;
    subShadowMarkAsCancelled: string;
    subShadowSharedWith: string;
    subShadowPriceHiked: string;
    subShadowPaidThisMonth: string;
    subShadowUpcomingBills: string;
    subShadowMicroBilling: string;
    subShadowLinkedTo: string;

    // AI Coach Section
    aiCoachTitle: string;
    aiCoachSummary: string;

    // Campaign CTAs (Tesla-style action buttons)
    ctaAddTransaction: string;
    ctaSetBudget: string;
    ctaViewReport: string;
    ctaSaveMoney: string;

  // Campaign Push Notification Labels
  pushGhostDetected: string;
  pushGuardianAlert: string;
  pushGoalProgress: string;

  // Slide to Upgrade / SwipeConfirm
  slideUpgrade: string;
  slideConfirm: string;
  swipeConfirm: string;

  // Common UI
  commonGoBack: string;
  commonInfo: string;

  // Profile Settings Page
  profileTitle: string;
  profileDefaultsName: string;
  profileSetupComplete: string;
  profileEditProfileAria: string;
  profileEditNamePrompt: string;
  profileEditEmailPrompt: string;
  profileLogOut: string;

  // Bottom Navigation
  bottomNavNavigation: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    brand: "PicksWise",
    subtitle: "EVERY FINANCIAL DECISION MATTERS",
    reserveVault: "PicksWise Sovereign Reserve",
    portfolioTitle: "Decision Portfolio",
    totalPortfolio: "Total Allocated Decisions Value",
    growthLabel: "+14.31% Action Growth",
    assetPerformance: "Decision Yield Analysis",
    liveFeed: "LIVE DECISION CONTEXT FEED",
    sparksLabel: "30d decision sparks",
    recentLedger: "Sovereign Decision Ledger",
    ledgerSub: "REAL TIME CALUATED INBOUNDS & OUTBOUNDS",
    searchPlaceholder: "Search decisions and actions...",
    noRecords: "NO DECISIONS MATCHING QUERY",
    coreBalance: "Core Balance Yield",
    deposit: "Allocate In",
    withdraw: "Deallocate",
    transfer: "Reroute Out",
    getPremium: "Unlock Version 5.2 Premium",
    sovereignVerified: "Sovereign Decision Verified",
    legalName: "AUTHENTICATED IDENTITY ID",
    commsRoute: "COMMUNICATION REALTIME ROUTING",
    terminateSession: "Terminate Session Securely",
    commitSpecs: "COMMIT SYSTEM SPECIFICATIONS",
    premiumOS: "VERSION 5.2 DESIGN OS",
    coreLevel: "PicksWise system level",
    currentOperationalTier: "Current Decision Tier",
    currentOperationalTierDesc: "Your active subscription plan and feature access level.",
    freeTierPitch: "You are running our uncalibrated basic node. High-integrity Twin profile, future trajectories, and infinite decision memory are locked.",
    activateLuxury: "ACTIVATE PREMIUM DECISION INTEGRITY",
    secureEncryptionTitle: "SANDBOX SAFETY ARCHITECTURE",
    secureEncryptionPitch: "Your PicksWise profile is isolated locally via standard Sandbox client storage. Internal parameters are verified against client-side safety layers. No advertising tracking.",
    yearsOfAutonomousCapital: "This series of wiser decisions yields $84k future capital.",

    introductionSkip: "Skip Introduction",
    moduleLabel: "MODULE",
    luxurySystem: "LUXURY SYSTEM",
    immediateImpact: "IMMEDIATE IMPACT",
    averageWeeklySavings: "Average Monthly Savings Boost",
    reducedRegret: "Reduced Unplanned Regrets",
    pathFreedom: "Path to Financial Freedom",
    moneyPulse: { title: "Money Pulse", subtitle: "Real-time financial heartbeat", desc: "See your money flow, track every transaction, understand your patterns instantly." },
    ghostHunt: { title: "Ghost Hunter", subtitle: "Find hidden subscriptions", desc: "AI detects subscriptions you forgot about and helps you cancel them." },
    storyBegins: { title: "Your Story Begins", subtitle: "Weekly money chapters", desc: "Get personalized weekly summaries that read like your financial diary." },
    guardianReady: { title: "Guardian Mode", subtitle: "Never overspend again", desc: "Smart budget alerts keep you on track before you exceed your limits." },
    readyLaunch: { title: "You're Ready", subtitle: "Start your journey", desc: "Your financial transformation starts now." },
    commitmentTitle: "Commitment Declaration",
    commitmentSubtitle: "Commit to your financial transformation",
    commitmentStatement: "I acknowledge that financial sovereignty begins with disciplined awareness. I commit to engaging with DailyStack honestly, tracking my behaviors consistently, and honoring the system that honors me.",
    commitmentConfirm: "I commit to this journey",
    commitmentDecline: "I need more time",
    nextStep: "NEXT CAPABILITY",
    financialChallenge: {
      question: "What's Your Core Financial Challenge?",
      options: [
        { title: "Save More Money", subtitle: "Reduce unnecessary spending and build a cushion" },
        { title: "Track Every Expense", subtitle: "Gain full visibility of where money goes" },
        { title: "Stop Wasted Subscriptions", subtitle: "Detect ghost subscriptions and cancel them fast" },
        { title: "Build Long-Term Wealth", subtitle: "Grow assets and plan for the future" }
      ]
    },
    onboardingSteps: [
      {
        title: "Track Your Spending Effortlessly",
        desc: "Manage your finances using our intuitive, user-friendly interface. Set physical benchmarks, analyze psychological buying indicators, and secure compound gains.",
        statsVal: "+24.6%",
        statsLabel: "Average Monthly Savings Boost"
      },
      {
        title: "Core Financial Challenge",
        desc: "Choose the goal that matters most to you right now",
        statsVal: "1 / 5",
        statsLabel: "Select one",
        type: "challenge"
      },
      {
        title: "See Your Subscription Shadow",
        desc: "Stop losing money silently. We surface every recurring charge, flag price hikes instantly, and show exactly where your subscriptions leak.",
        statsVal: "-38.2%",
        statsLabel: "Reduced Unplanned Charges"
      },
      {
        title: "Your Personal AI Money Coach",
        desc: "Get stories, not spreadsheets. Our AI digest compiles your cash flow into clear weekly insights, mapping future savings against daily habits.",
        statsVal: "2x Faster",
        statsLabel: "Path to Financial Freedom"
      },
      {
        title: "Commitment Declaration",
        desc: "Commit to your financial transformation",
        statsVal: "Step 5",
        statsLabel: "Final Commitment"
      }
    ],

    launchOS: "Launch OS",

    secureFinOS: "Secure Financial OS",
    loginSub: "Access the system with Face ID for maximum security and speed.",
    emailId: "EMAIL ID OR ACCOUNT",
    authSuccess: { title: "Login Successful!", subtitle: "Taking you to your dashboard..." },

    // OTP Screen
    otpTitle: "Verify Your Email",
    otpSubtitle: "We've sent a verification code to",
    otpEnterCode: "Enter 6-digit code",
    otpVerifyBtn: "Verify Email",
    otpResendQuestion: "Didn't receive the code?",
    otpResendIn: "Resend in",
    otpResend: "Resend Code",
    otpBack: "← Back to login",
    otpSuccessTitle: "Email Verified!",
    otpSuccessVerify: "Email Verified!",
    otpSuccessReset: "Password Reset!",
    otpSuccessVerifySub: "Your email has been verified. Welcome to PicksWise!",
    otpSuccessResetSub: "You can now set a new password for your account.",
    otpContinueBtn: "Continue to Dashboard",
    otpResetPasswordBtn: "Set New Password",
    otpSecureVerification: "Secure Verification",
    otpInvalidError: "Invalid verification code. Please try again.",
    otpFailedError: "Verification failed. Please try again.",
    otpResendError: "Failed to resend code. Please try again.",
    password: "PASSWORD",
    forgot: "Forgot?",
    enterOS: "ENTER FINANCIAL OPERATING SYSTEM",
    initAccount: "INITIALIZE SYSTEM ACCOUNT",
    orMaster: "OR MASTER INTEGRATION",
    appleCard: "Apple Card",
    googleCloud: "Google Cloud",
    alreadyEngineered: "Already engineered your seat?",
    newToDailyStack: "New to DailyStack FinTech?",
    loginCore: "Log In Core",
    registerSecurely: "Register Securely",
    bankSecured: "AES-256 BANK GRADE SECURED",

    // Base Currency Selection
    baseCurrencyTitle: "Select Your Base Currency",
    baseCurrencySub: "Choose your primary currency for all calculations and tracking",
    baseCurrencySelect: "Select Currency",
    baseCurrencyConfirm: "Confirm Currency",
    baseCurrencyTHB: "Thai Baht (THB)",
    baseCurrencyUsd: "US Dollar (USD)",
    baseCurrencyEur: "Euro (EUR)",
    baseCurrencyGbp: "British Pound (GBP)",
    baseCurrencyJpy: "Japanese Yen (JPY)",
    baseCurrencySgd: "Singapore Dollar (SGD)",

    identityRadar: "IDENTITY ANALYSIS RADAR",
    coreSignature: "Core Financial Signature",
    confidenceScore: "ANALYSIS INTEGRITY CONFIDENCE",
    biometricIndicators: "Biometric Financial Indicators",
    calibrationsTitle: "ESTABLISHED COGNITIVE CALIBRATIONS",
    impulseRating: "Dopamine Impulse Rating",
    futureHorizon: "Future Horizon Orientation",
    socialDefense: "Social Pressure Defense",
    valueSeeking: "Calculated Value Seeking",
    tacticalEngine: "TACTICAL ADVISORY ENGINE",
    readyReasoning: "ONLINE READY • ADVANCED REASONING LOADED",
    infiniteMemory: "Get Infinite Memory",
    chatPlaceholder: 'Ask: "Why do I suffer unplanned spending spikes?" or "Establish a budget plan"',
    chatProcessing: "Cognitive agent is processing behavioral calibrations...",

    valueInsightsTitle: "Value & Behavior Insights",
    valueInsightsSub: "PSYCHOLOGICAL LEDGER & PATTERN CALIBRATION",
    spendCalculation: "EXPENDITURE CALCULATION",
    spendSub: "Aggregated Current Session Regrets",
    categoryDensity: "CATEGORICAL DENSITY EXCLUSIVITY",
    radarRevelation: "RADAR REVELATIONS",
    dopamineOutflows: "Dopamine Outflows Regulated",
    impulseDecreasedText: "Your impulse index decreased by 12.4% this month. Rerouting those funds saved you approximately $340.00 which directly compounds inside your core investment classes.",
    topRegulatedClass: "Top Regulated Class: Technology Outflows",
    deepCoreTitle: "BEHAVIOR DEEP-CORE SCANNING",
    deepCoreSub: "Unlock fully automated micro-story analysis of your financial future self.",
    upgradeFutureOS: "UPGRADE FUTURE OPERATING SYSTEM",

    assetAnalysis: "ASSET ANALYSIS ENGINE",
    unitSharePrice: "UNIT SHARE PRICE",
    percentageMetric: "PERCENTAGE METRIC",
    chartFluctuations: "COMPREHENSIVE 30D VALUATION FLUCTUATIONS",
    sellPosition: "Sell Position",
    acquireShares: "Acquire Shares",
    simulatedSell: "Sell action on {symbol} simulated. Integrations are available in our Premium Operating System.",
    simulatedBuy: "Buy action on {symbol} simulated. Integrations are available in our Premium Operating System.",

    inboundVault: "Inbound Vault Funding",
    outboundVault: "Outbound Vault Liquidation",
    externalWallet: "External Wallet routing",
    recipientRouting: "RECIPIENT ROUTING IDENTIFIER",
    transactionCost: "TRANSACTION COST ($ USD)",
    actionAmountError: "Please enter a valid amount.",
    withdrawError: "Insufficient balance in your Core Vault.",
    transferError: "Insufficient balance to execute external routing.",
    transferRecipientError: "Please declare a valid recipient wallet identifier.",
    depositSuccess: "Successfully vaulted +${amount}",
    withdrawSuccess: "Withdrew -${amount} from Vault",
    transferSuccess: "Transferred -${amount} to {recipient}",
    executeProtocol: "EXECUTE SECURE PROTOCOL",
    quickActionPrompt: "Triggered from Quick Vault actions",

    alternativeVaultTitle: "Alternative Assets Vault",
    alternativeVaultSub: "Analyze your alternative investment behaviors",
    alternativeAddAsset: "Add New Asset",
    alternativeEditAsset: "Edit Asset",
    alternativeDeleteAsset: "Delete Asset",
    alternativeTotalValue: "Total Value",
    alternativeTotalPL: "Profit / Loss",
    alternativeAvgReturn: "Avg Return",
    alternativeNoAssets: "No alternative assets yet",
alternativeLocked: "ELITE Tier Required",
    alternativeLockedDesc: "Unlock the Alternative Assets Vault with ELITE plan",

    // Budget Management Page
    budgetTitle: "Spending Guardian",
    budgetSub: "PLAN & TRACK YOUR GUARDIAN PROTECTION",
    budgetOverviewTab: "Overview",
    budgetCategoriesTab: "Categories",
    budgetGoalsTab: "Goals",
    budgetTotalBudget: "Monthly Guardian Limit",
    budgetSpent: "Spent",
    budgetLeft: "Remaining",
    budgetDaysLeft: "Days Left",
    budgetAvgDay: "Avg/Day",
    budgetProjected: "Projected",
    budgetOverBudget: "Over Guardian",
    budgetNearLimit: "Near Limit",
    budgetMonthlyTrend: "Monthly Trend",
    budgetAIRecommendation: "Guardian Recommendation",
    budgetSetCoolRule: "Set Cooling Rule",
    budgetAddCategory: "Add Guardian Category",
    budgetEditCategory: "Edit Guardian Category",
    budgetCategoryName: "Guardian Name",
    budgetMonthlyLimit: "Monthly Limit",
    budgetSave: "Save",
    budgetCancel: "Cancel",
    budgetDeleteCategory: "Delete Guardian",
    budgetDeleteConfirm: "Are you sure?",
    budgetProgressBar: "Progress",
    budgetOverBudgetAlert: "Guardian Alert",
    budgetAddFirstBudget: "Set your first Guardian",
    budgetNoCategories: "No Guardians yet",
    budgetUnlockElite: "Unlock with ELITE",
    budgetEliteFeature: "Advanced Guardian analytics & multi-month trends",
    budgetCreateFirst: "Create Guardian",
    budgetAllGoals: "All Goals",

    // Goal Simulation Page
    goalSimulationTitle: "Goal Launcher",
    goalSimulationSub: "Ignite and track your financial trajectories",
    goalSimulationGoalsTab: "Goals",
    goalSimulationSimulationTab: "Simulation",
    goalSimulationUnlockElite: "Unlock Elite",
    goalSimulationTargetDate: "Target Date",
    goalSimulationRemaining: "Remaining",
    goalSimulationSaved: "Saved",
    goalSimulationTarget: "Target",
    goalSimulationMonths: "Months",
    goalSimulationAIRecommendation: "AI Recommendation",
    goalSimulationScenario: "Simulation Scenario",
    goalSimulationModerateGrowth: "Moderate Growth",
    goalSimulationAggressiveSave: "Aggressive Save",
    goalSimulationRelaxedPace: "Relaxed Pace",
    goalSimulationMonthlyContribution: "Monthly Contribution",
    goalSimulationProjectedTimeline: "Projected Timeline",
    goalSimulation24Months: "24 months projection",
    goalSimulationRun: "Run",
    goalSimulationSimulating: "Simulating...",
    goalSimulationProjectedValue: "Projected Value",
    goalSimulationTimeToGoal: "Time to Goal",
    goalSimulationAIInsight: "AI Insight",
    goalSimulationUnlockAdvanced: "Unlock Advanced Simulations",
    goalSimulationUnlockAdvancedDesc: "Get access to advanced projections, multiple goal tracking, and AI-powered scenario comparisons.",
    goalSimulationUpgradeElite: "Upgrade to Elite",
    goalSimulationComplete: "Complete",
    goalSimulationNow: "Now",
    goalSimulationReturn: "return",

    netWorthHeroLabel: "NET WORTH",
    netWorthPositiveChange: "+$320 from yesterday",
    netWorthNegativeChange: "-$180 from yesterday",
    assetBreakdownTitle: "Assets vs Liabilities",
    quickAddPlaceholder: "How much did you spend?",
    aiCategorySuggestion: "AI Suggestion • Confirm",
    underBudgetProgress: "Remaining $2,400 until end of month",
    overBudgetProgress: "Over Guardian this month by 15%...",
    subscriptionWarning3Days: "Charged in 3 days • $299",
    adaptiveFABMessage: "Record your first expense to start behavioral analysis today.",

    // PaywallPage
    paywallHeading: "Get PicksWise",
    paywallSubheading: "Unlock your financial potential",
    paywallTogglePro: "PRO",
    paywallToggleElite: "ELITE",
    paywallPerYear: "/year",
    paywallPerMonth: "/month",
    paywallSubscribe: "Subscribe",
    paywallAutoRenew: "Auto-renews monthly. Cancel anytime.",
    paywallWelcome: "Welcome to Premium!",
    paywallSuccessText: "You can now access premium features",
    paywallGetStarted: "Get Started",
    paywallFeatures: "Features",
    paywallFree: "Free",
    paywallLoading: "Loading...",
    paywallScanQr: "Scan QR to pay with PromptPay",
    paywallScanQrHint: "Open your banking app and scan this QR code to complete payment",
    paywallWaitingPayment: "Waiting for payment...",
    paywallQrExpiresIn: "QR expires in",
    paywallPaymentFailed: "Payment failed. Please try again.",
    paywallBack: "Back",
    paywallQrExpired: "QR code expired",
    paywallTryAgain: "Try Again",

    // Subscription Shadow Page
    subscriptionShadowTitle: "Subscription Shadow",
    subscriptionShadowSubtitle: "Financial Intelligence Layer",
    subShadowAddBtn: "Add",
    subShadowMonthly: "Monthly",
    subShadowTotalRecurring: "Total recurring",
    subShadowYearly: "Yearly",
    subShadowProjectedAnnual: "Projected annual",
    subShadowThisWeek: "This Week",
    subShadowCharges: "charges",
    subShadowActiveCount: "Active",
    subShadowActiveLabel: "subscriptions",
    subShadowAllFilter: "All",
    subShadowPausedFilter: "Paused",
    subShadowCancelledFilter: "Cancelled",
    subShadowSortLabel: "Sort:",
    subShadowSortNextBilling: "Next Billing",
    subShadowSortAmount: "Amount",
    subShadowSortName: "Name",
    subShadowNoSubs: "No subscriptions yet",
    subShadowNoSubsDesc: "Start tracking your recurring payments to get financial clarity",
    subShadowAddFirst: "Add First Subscription",
    subShadowDueToday: "Due today",
    subShadowTomorrow: "Tomorrow",
    subShadowDays: "days",
    subShadowNextBillingDate: "Next Billing Date",
    subShadowLastUsed: "Last Used",
    subShadowFrequency: "Frequency",
    subShadowAnnualCost: "Annual Cost",
    subShadowCancelBtn: "Cancel",
    subShadowReactivateBtn: "Reactivate",
    subShadowDeleteBtn: "Delete",
    subShadowCategoryBreakdown: "Category Breakdown",
    subShadowUpcomingCharges: "Upcoming Charges",
    subShadowNoChargesThisWeek: "No charges this week",
    subShadowAiInsightTitle: "AI INSIGHT",
    subShadowSavingsPotential: "Monthly Savings Potential",
    subShadowAddModalTitle: "Add Subscription",
    subShadowAddModalDesc: "Track a recurring payment",
    subShadowServiceName: "Service Name",
    subShadowBillingCycle: "Billing Cycle",
    subShadowCategory: "Category",
    subShadowNextBillingOptional: "Next Billing Date (Optional)",
    subShadowCalendarTab: "Calendar View",
    subShadowListTab: "List View",
    subShadowConciergeTitle: "Cancellation Assistant",
    subShadowConciergeDesc: "Let PicksWise handle the cancellation or manage it directly:",
    subShadowConciergeBtn: "AI Concierge Cancel",
    subShadowCancelPhone: "Phone",
    subShadowCancelEmail: "Email",
    subShadowCancelWeb: "Website",
    subShadowViewCancelInstructions: "View Instructions",
    subShadowUpcomingTab: "Upcoming",
    subShadowAllTab: "All",
    subShadowComingUpCardTitle: "Coming Up",
    subShadowLeftToPay: "Left to Pay",
    subShadowActiveSubscriptions: "Active Services",
    subShadowPredictiveAmount: "Predictive",
    subShadowSkipThisMonth: "Skip This Month",
    subShadowEditAmount: "Edit Amount",
    subShadowMarkAsCancelled: "Mark as Cancelled",
    subShadowSharedWith: "Shared with",
    subShadowPriceHiked: "Price Hiked",
    subShadowPaidThisMonth: "Paid This Month",
    subShadowUpcomingBills: "Upcoming Bills",
    subShadowMicroBilling: "Micro-billing",
    subShadowLinkedTo: "Linked to",

    // AI Coach Section
    aiCoachTitle: "AI Coach",
    aiCoachSummary: "Your spending this month is higher than usual. Consider reducing 2 unnecessary expenses.",

    // Campaign CTAs (Tesla-style action buttons)
    ctaAddTransaction: "+ Money Pulse",
    ctaSetBudget: "Set Guardian",
    ctaViewReport: "Read My Story",
    ctaSaveMoney: "Ignite Goal",

    // Campaign Push Notification Labels
    pushGhostDetected: "Ghost Detected",
    pushGuardianAlert: "Guardian Alert",
    pushGoalProgress: "Goal Progress",

    // Slide to Upgrade / SwipeConfirm
    slideUpgrade: "Slide to Unlock",
    slideConfirm: "Slide to confirm",
    swipeConfirm: "Swipe to confirm",

    // Common UI
    commonGoBack: "Go back",
    commonInfo: "Info",

    // Profile Settings Page
    profileTitle: "Profile",
    profileDefaultsName: "Your Name",
    profileSetupComplete: "Setup complete",
    profileEditProfileAria: "Edit profile",
    profileEditNamePrompt: "Edit name:",
    profileEditEmailPrompt: "Edit email:",
    profileLogOut: "Log Out",

    // Bottom Navigation
    bottomNavNavigation: "Primary Navigation",
  },
  th: {

    brand: "PicksWise",
    subtitle: "ทุกการตัดสินใจทางการเงินมีความหมาย",
    reserveVault: "คลังสำรอง PicksWise Sovereign",
    portfolioTitle: "พอร์ตการตัดสินใจ",
    totalPortfolio: "มูลค่ารวมการตัดสินใจที่จัดสรรแล้ว",
    growthLabel: "+14.31% การเติบโตของการกระทำ",
    assetPerformance: "การวิเคราะห์ผลตอบแทนการตัดสินใจ",
    liveFeed: "ฟีดข้อมูลสถานการณ์การตัดสินใจแบบสด",
    sparksLabel: "ประกายการตัดสินใจใน 30 วัน",
    recentLedger: "บัญชีแยกประเภทการตัดสินใจ Sovereign",
    ledgerSub: "ยอดเงินเข้าและออกที่คำนวณแบบเรียลไทม์",
    searchPlaceholder: "ค้นหาการตัดสินใจและการกระทำ...",
    noRecords: "ไม่พบการตัดสินใจที่ตรงกับคำค้นหา",
    coreBalance: "ผลตอบแทนยอดเงินหลัก",
    deposit: "จัดสรรเข้า",
    withdraw: "ถอนการจัดสรร",
    transfer: "โอนออกภายนอก",
    getPremium: "ปลดล็อกเวอร์ชัน 5.2 พรีเมียม",
    sovereignVerified: "ยืนยันการตัดสินใจแบบ Sovereign แล้ว",
    legalName: "หมายเลขประจำตัวตนที่ยืนยันแล้ว",
    commsRoute: "การจัดเส้นทางการสื่อสารแบบเรียลไทม์",
    terminateSession: "สิ้นสุดเซสชันอย่างปลอดภัย",
    commitSpecs: "ข้อมูลจำเพาะระบบที่บันทึกไว้",
    premiumOS: "เวอร์ชัน 5.2 ดีไซน์ OS",
    coreLevel: "ระดับระบบ PicksWise",
    currentOperationalTier: "ระดับการตัดสินใจปัจจุบัน",
    currentOperationalTierDesc: "แผนการสมัครสมาชิกที่ใช้งานอยู่และระดับการเข้าถึงฟีเจอร์ของคุณ",
    freeTierPitch: "คุณกำลังใช้งานระบบพื้นฐานที่ไม่ได้ปรับเทียบ โปรไฟล์ทวินที่มีความแม่นยำสูง เส้นทางในอนาคต และหน่วยความจำการตัดสินใจที่ไม่จำกัดยังคงถูกล็อคอยู่",
    activateLuxury: "เปิดใช้งานความแม่นยำของการตัดสินใจระดับพรีเมียม",
    secureEncryptionTitle: "สถาปัตยกรรมความปลอดภัยแบบแซนด์บ็อกซ์",
    secureEncryptionPitch: "โปรไฟล์ PicksWise ของคุณถูกแยกไว้ในเครื่องผ่านไคลเอนต์จัดเก็บข้อมูลแบบแซนด์บ็อกซ์มาตรฐาน พารามิเตอร์ภายในได้รับการตรวจสอบกับระดับความปลอดภัยฝั่งไคลเอนต์ ไม่มีการติดตามเพื่อโฆษณา",
    yearsOfAutonomousCapital: "ชุดการตัดสินใจที่ฉลาดขึ้นนี้จะสร้างทุนในอนาคตได้ $84k",

    introductionSkip: "ข้ามคำแนะนำ",
    moduleLabel: "โมดูล",
    luxurySystem: "ระบบระดับหรู",
    immediateImpact: "ผลลัพธ์ทันที",
    averageWeeklySavings: "ยอดออมเฉลี่ยต่อเดือนที่เพิ่มขึ้น",
    reducedRegret: "ลดความเสียดายที่ไม่ได้วางแผน",
    pathFreedom: "เส้นทางสู่อิสรภาพทางการเงิน",
    moneyPulse: { title: "พัลส์เงิน", subtitle: "จังหวะหัวใจทางการเงินแบบเรียลไทม์", desc: "ดูการไหลเวียนของเงิน ติดตามทุกธุรกรรม และเข้าใจรูปแบบพฤติกรรมของคุณทันที" },
    ghostHunt: { title: "ผู้ล่าบอกรับสมาชิก", subtitle: "ค้นหาการสมัครบริการที่ซ่อนอยู่", desc: "AI ตรวจจับการสมัครบริการที่คุณลืมและช่วยคุณยกเลิกได้ทันที" },
    storyBegins: { title: "เรื่องราวของคุณเริ่มต้นขึ้น", subtitle: "บทสรุปการเงินรายสัปดาห์", desc: "รับสรุปพฤติกรรมการเงินรายสัปดาห์ในรูปแบบเรื่องราวที่อ่านง่ายเหมือนไดอารี่ส่วนตัว" },
    guardianReady: { title: "เปิดโหมดผู้พิทักษ์", subtitle: "ไม่ใช้เงินเกินตัวอีกต่อไป", desc: "การแจ้งเตือนงบประมาณอัจฉริยะช่วยให้คุณอยู่ในเส้นทางที่ถูกต้องก่อนที่จะเกินวงเงิน" },
    readyLaunch: { title: "คุณพร้อมแล้ว", subtitle: "เริ่มต้นการเดินทางของคุณ", desc: "การเปลี่ยนแปลงทางการเงินของคุณเริ่มต้นขึ้นตอนนี้" },
    commitmentTitle: "คำประกาศข้อตกลงร่วมกัน",
    commitmentSubtitle: "มุ่งมั่นที่จะปฏิวัติทางการเงินของคุณ",
    commitmentStatement: "ข้าพเจ้ายอมรับว่าอิสรภาพทางการเงินเริ่มต้นด้วยวินัยและความตระหนักรู้ ข้าพเจ้าสัญญาว่าจะใช้ PicksWise อย่างซื่อสัตย์ ติดตามพฤติกรรมอย่างสม่ำเสมอ และเคารพระบบที่ให้เกียรติข้าพเจ้า",
    commitmentConfirm: "ฉันมุ่งมั่นในการเดินทางครั้งนี้",
    commitmentDecline: "ฉันยังต้องการเวลาอีก",
    nextStep: "ความสามารถถัดไป",
    financialChallenge: {
      question: "ความท้าทายทางการเงินหลักของคุณคืออะไร ?",
      options: [
        { title: "เก็บออมเงินให้มากขึ้น", subtitle: "ลดการใช้จ่ายที่ไม่จำเป็นและสร้างเงินสำรอง" },
        { title: "ติดตามทุกค่าใช้จ่าย", subtitle: "สร้างความชัดเจนว่าเงินของคุณถูกใช้ไปที่ไหนบ้าง" },
        { title: "หยุดรั่วไหลจากค่าสมัคร", subtitle: "ตรวจพบค่าสมัครที่ลืมแล้วยกเลิกได้ทันที" },
        { title: "สร้างความมั่งคั่งระยะยาว", subtitle: "เพิ่มพูนสินทรัพย์และวางแผนสำหรับอนาคต" }
      ]
    },
    onboardingSteps: [
      {
        title: "ติดตามค่าใช้จ่ายของคุณได้อย่างง่ายดาย",
        desc: "จัดการการเงินของคุณด้วยอินเทอร์เฟซที่ใช้งานง่าย ตั้งเกณฑ์มาตรฐาน วิเคราะห์ดัชนีทางจิตวิทยาการซื้อ และรักษาผลประโยชน์ทบต้นของคุณอย่างปลอดภัย",
        statsVal: "+24.6%",
        statsLabel: "ยอดออมเฉลี่ยต่อเดือนที่เพิ่มขึ้น"
      },
      {
        title: "ความท้าทายทางการเงินหลัก",
        desc: "เลือกเป้าหมายที่สำคัญที่สุดสำหรับคุณในตอนนี้",
        statsVal: "1 / 5",
        statsLabel: "เลือกหนึ่งรายการ",
        type: "challenge"
      },
      {
        title: "เห็นเงาการสมัครของคุณ",
        desc: "หยุดเงินรั่วไหลอย่างเงียบๆ เราแสดงค่าสมัครรายเดือนทุกรายการ แจ้งเตือนเมื่อราคาขึ้นทันที และชี้ให้เห็นว่าค่าสมัครของคุณหลุดออกจากมือตรงไหน",
        statsVal: "-38.2%",
        statsLabel: "ลดค่าใช้จ่ายที่ไม่ได้วางแผน"
      },
      {
        title: "โค้ชการเงินส่วนตัวด้วย AI",
        desc: "รับข้อมูลในรูปแบบเรื่องราว ไม่ใช่แค่ตัวเลข ระบบ AI ของเราสังเคราะห์กระแสเงินสดของคุณเป็นข้อมูลเชิงลึกรายสัปดาห์ที่ชัดเจน เพื่อให้คุณเห็นเป้าหมายการออมในอนาคตเทียบกับนิสัยการใช้จ่ายในแต่ละวัน",
        statsVal: "เร็วขึ้น 2 เท่า",
        statsLabel: "เส้นทางสู่อิสรภาพทางการเงิน"
      },
      {
        title: "คำประกาศข้อตกลงร่วมกัน",
        desc: "มุ่งมั่นที่จะปฏิวัติทางการเงินของคุณ",
        statsVal: "ขั้นตอนที่ 5",
        statsLabel: "การมุ่งมั่นขั้นสุดท้าย"
      }
    ],

    launchOS: "เปิดใช้งานระบบ",

    secureFinOS: "ระบบการเงินปลอดภัย",
    loginSub: "เข้าสู่ระบบด้วย Face ID เพื่อความปลอดภัยสูงสุดและความรวดเร็ว",
    emailId: "อีเมล หรือ บัญชีผู้ใช้งาน",
    authSuccess: { title: "เข้าสู่ระบบสำเร็จ!", subtitle: "กำลังนำคุณไปยังแดชบอร์ด..." },

    // OTP Screen
    otpTitle: "ยืนยันอีเมลของคุณ",
    otpSubtitle: "เราได้ส่งรหัสยืนยันไปยัง",
    otpEnterCode: "กรอกรหัส 6 หลัก",
    otpVerifyBtn: "ยืนยันอีเมล",
    otpResendQuestion: "ไม่ได้รับรหัสใช่ไหม?",
    otpResendIn: "ส่งอีกครั้งใน",
    otpResend: "ส่งรหัสอีกครั้ง",
    otpBack: "← กลับสู่หน้าล็อกอิน",
    otpSuccessTitle: "ยืนยันอีเมลสำเร็จ!",
    otpSuccessVerify: "ยืนยันอีเมลแล้ว!",
    otpSuccessReset: "รีเซ็ตรหัสผ่านแล้ว!",
    otpSuccessVerifySub: "อีเมลของคุณได้รับการยืนยันแล้ว ยินดีต้อนรับสู่ PicksWise!",
    otpSuccessResetSub: "คุณสามารถตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณได้แล้ว",
    otpContinueBtn: "เข้าสู่แดชบอร์ด",
    otpResetPasswordBtn: "ตั้งรหัสผ่านใหม่",
    otpSecureVerification: "การยืนยันที่ปลอดภัย",
    otpInvalidError: "รหัสยืนยันไม่ถูกต้อง กรุณาลองอีกครั้ง",
    otpFailedError: "การยืนยันล้มเหลว กรุณาลองอีกครั้ง",
    otpResendError: "ส่งรหัสอีกครั้งล้มเหลว กรุณาลองอีกครั้ง",
    password: "รหัสผ่าน",
    forgot: "ลืมรหัสผ่าน?",
    enterOS: "เข้าสู่ระบบปฏิบัติการทางการเงิน",
    initAccount: "เริ่มต้นบัญชีระบบ",
    orMaster: "หรือเชื่อมต่อบัญชีหลัก",
    appleCard: "Apple Card",
    googleCloud: "Google Cloud",
    alreadyEngineered: "มีบัญชีอยู่แล้วใช่ไหม?",
    newToDailyStack: "เพิ่งเริ่มใช้ PicksWise?",
    loginCore: "เข้าสู่ระบบหลัก",
    registerSecurely: "ลงทะเบียนอย่างปลอดภัย",
    bankSecured: "ระบบความปลอดภัยระดับธนาคาร AES-256",

    // Base Currency Selection
    baseCurrencyTitle: "เลือกสกุลเงินหลักของคุณ",
    baseCurrencySub: "เลือกสกุลเงินหลักสำหรับการคำนวณและติดตามข้อมูลทั้งหมด",
    baseCurrencySelect: "เลือกสกุลเงิน",
    baseCurrencyConfirm: "ยืนยันสกุลเงิน",
    baseCurrencyTHB: "บาทไทย (THB)",
    baseCurrencyUsd: "ดอลลาร์สหรัฐ (USD)",
    baseCurrencyEur: "ยูโร (EUR)",
    baseCurrencyGbp: "ปอนด์อังกฤษ (GBP)",
    baseCurrencyJpy: "เยนญี่ปุ่น (JPY)",
    baseCurrencySgd: "ดอลลาร์สิงคโปร์ (SGD)",

    identityRadar: "เรดาร์วิเคราะห์ตัวตน",
    coreSignature: "ลายเซ็นทางการเงินหลัก",
    confidenceScore: "ความน่าเชื่อถือของการวิเคราะห์",
    biometricIndicators: "ตัวบ่งชี้ทางการเงินเชิงชีวภาพ",
    calibrationsTitle: "การประเมินการรับรู้ทางการเงิน",
    impulseRating: "ระดับแรงกระตุ้นโดปามีน",
    futureHorizon: "เป้าหมายในอนาคต",
    socialDefense: "ภูมิคุ้มกันแรงกดดันทางสังคม",
    valueSeeking: "การแสวงหาคุณค่าที่คำนวณไว้",
    tacticalEngine: "ระบบแนะนำเชิงยุทธวิธี",
    readyReasoning: "ระบบออนไลน์ • โหลดการคิดวิเคราะห์ขั้นสูงแล้ว",
    infiniteMemory: "รับความจำไม่จำกัด",
    chatPlaceholder: "ถาม: \"ทำไมฉันถึงมียอดใช้จ่ายพุ่งขึ้นโดยไม่ได้วางแผน?\" หรือ \"ช่วยจัดแผนงบประมาณให้หน่อย\"",
    chatProcessing: "ระบบอัจฉริยะกำลังประมวลผลการวิเคราะห์พฤติกรรม...",

    valueInsightsTitle: "ข้อมูลเชิงลึกด้านคุณค่าและพฤติกรรม",
    valueInsightsSub: "การคำนวณทางจิตวิทยาและรูปแบบพฤติกรรม",
    spendCalculation: "การคำนวณยอดใช้จ่าย",
    spendSub: "ยอดใช้จ่ายที่รู้สึกเสียดายสะสมในการใช้งานรอบนี้",
    categoryDensity: "ความหนาแน่นรายหมวดหมู่เฉพาะ",
    radarRevelation: "ข้อมูลเปิดเผยจากเรดาร์",
    dopamineOutflows: "ควบคุมการใช้จ่ายตามอารมณ์แล้ว",
    impulseDecreasedText: "ระดับแรงกระตุ้นของคุณลดลง 12.4% ในเดือนนี้ การเปลี่ยนทิศทางเงินส่วนนั้นช่วยให้คุณประหยัดเงินได้ประมาณ $340.00 ซึ่งถูกนำไปลงทุนทบต้นในสินทรัพย์หลักของคุณโดยตรง",
    topRegulatedClass: "หมวดหมู่ควบคุมได้ดีที่สุด: ยอดใช้จ่ายด้านเทคโนโลยี",
    deepCoreTitle: "สแกนลึกระดับพฤติกรรม",
    deepCoreSub: "ปลดล็อกการวิเคราะห์อนาคตทางการเงินของคุณด้วยเรื่องราวสั้น ๆ แบบอัตโนมัติ",
    upgradeFutureOS: "อัปเกรดระบบปฏิบัติการแห่งอนาคต",

    assetAnalysis: "ระบบวิเคราะห์สินทรัพย์",
    unitSharePrice: "ราคาหุ้นต่อหน่วย",
    percentageMetric: "ตัวชี้วัดเปอร์เซ็นต์",
    chartFluctuations: "ประวัติการขึ้นลงของมูลค่าในรอบ 30 วัน",
    sellPosition: "ขายสินทรัพย์",
    acquireShares: "ซื้อหุ้น",
    simulatedSell: "จำลองการขาย {symbol} เรียบร้อยแล้ว ฟีเจอร์จริงจะเปิดใช้งานในระบบระดับพรีเมียม",
    simulatedBuy: "จำลองการซื้อ {symbol} เรียบร้อยแล้ว ฟีเจอร์จริงจะเปิดใช้งานในระบบระดับพรีเมียม",

    inboundVault: "ฝากเงินเข้าคลังเก็บเงิน",
    outboundVault: "ถอนเงินจากคลังเก็บเงิน",
    externalWallet: "โอนไปยังกระเป๋าเงินภายนอก",
    recipientRouting: "หมายเลขบัญชีผู้รับปลายทาง",
    transactionCost: "ค่าธรรมเนียมธุรกรรม ($ USD)",
    actionAmountError: "กรุณากรอกจำนวนเงินที่ถูกต้อง",
    withdrawError: "ยอดเงินคงเหลือในคลังเก็บเงินไม่เพียงพอ",
    transferError: "ยอดเงินคงเหลือไม่เพียงพอสำหรับการโอนภายนอก",
    transferRecipientError: "กรุณาระบุหมายเลขกระเป๋าเงินผู้รับที่ถูกต้อง",
    depositSuccess: "ฝากเงินเข้าคลังสำเร็จ +${amount}",
    withdrawSuccess: "ถอนเงินจากคลังสำเร็จ -${amount}",
    transferSuccess: "โอนเงินสำเร็จ -${amount} ไปยัง {recipient}",
    executeProtocol: "ดำเนินการตามระบบความปลอดภัย",
    quickActionPrompt: "สั่งการด่วนจากคลังเก็บเงิน",

    alternativeVaultTitle: "คลังเก็บสินทรัพย์ทางเลือก",
    alternativeVaultSub: "วิเคราะห์พฤติกรรมการลงทุนในสินทรัพย์ทางเลือกของคุณ",
    alternativeAddAsset: "เพิ่มสินทรัพย์ใหม่",
    alternativeEditAsset: "แก้ไขสินทรัพย์",
    alternativeDeleteAsset: "ลบสินทรัพย์",
    alternativeTotalValue: "มูลค่ารวม",
    alternativeTotalPL: "กำไร / ขาดทุน",
    alternativeAvgReturn: "ผลตอบแทนเฉลี่ย",
    alternativeNoAssets: "ยังไม่มีสินทรัพย์ทางเลือก",
    alternativeLocked: "จำเป็นต้องใช้ระดับ ELITE",
    alternativeLockedDesc: "ปลดล็อกคลังเก็บสินทรัพย์ทางเลือกด้วยแผน ELITE",

    // Budget Management Page
    budgetTitle: "ผู้พิทักษ์การใช้จ่าย",
    budgetSub: "วางแผนและติดตามการคุ้มครองการใช้จ่ายของคุณ",
    budgetOverviewTab: "ภาพรวม",
    budgetCategoriesTab: "หมวดหมู่",
    budgetGoalsTab: "เป้าหมาย",
    budgetTotalBudget: "ขีดจำกัดผู้พิทักษ์รายเดือน",
    budgetSpent: "ใช้ไปแล้ว",
    budgetLeft: "คงเหลือ",
    budgetDaysLeft: "จำนวนวันคงเหลือ",
    budgetAvgDay: "เฉลี่ยต่อวัน",
    budgetProjected: "ยอดประมาณการ",
    budgetOverBudget: "ใช้จ่ายเกินขีดจำกัด",
    budgetNearLimit: "ใกล้เต็มขีดจำกัด",
    budgetMonthlyTrend: "แนวโน้มรายเดือน",
    budgetAIRecommendation: "คำแนะนำผู้พิทักษ์",
    budgetSetCoolRule: "ตั้งกฎหักห้ามใจ",
    budgetAddCategory: "เพิ่มหมวดหมู่ผู้พิทักษ์",
    budgetEditCategory: "แก้ไขหมวดหมู่ผู้พิทักษ์",
    budgetCategoryName: "ชื่อผู้พิทักษ์",
    budgetMonthlyLimit: "วงเงินรายเดือน",
    budgetSave: "บันทึก",
    budgetCancel: "ยกเลิก",
    budgetDeleteCategory: "ลบผู้พิทักษ์",
    budgetDeleteConfirm: "คุณแน่ใจหรือไม่?",
    budgetProgressBar: "ความคืบหน้า",
    budgetOverBudgetAlert: "แจ้งเตือนเกินขีดจำกัด",
    budgetAddFirstBudget: "ตั้งค่าผู้พิทักษ์รายแรกของคุณ",
    budgetNoCategories: "ยังไม่มีผู้พิทักษ์การใช้จ่าย",
    budgetUnlockElite: "ปลดล็อกด้วยแผน ELITE",
    budgetEliteFeature: "การวิเคราะห์ผู้พิทักษ์ขั้นสูงและแนวโน้มหลายเดือน",
    budgetCreateFirst: "สร้างผู้พิทักษ์",
    budgetAllGoals: "เป้าหมายทั้งหมด",

    // Goal Simulation Page
    goalSimulationTitle: "ตัวปล่อยเป้าหมาย",
    goalSimulationSub: "วางแผนอนาคตทางการเงินของคุณด้วยสถานการณ์จำลองอัจฉริยะ",
    goalSimulationGoalsTab: "เป้าหมาย",
    goalSimulationSimulationTab: "การจำลอง",
    goalSimulationUnlockElite: "ปลดล็อก Elite",
    goalSimulationTargetDate: "วันที่เป้าหมาย",
    goalSimulationRemaining: "ยอดคงเหลือที่ต้องเก็บ",
    goalSimulationSaved: "เก็บออมแล้ว",
    goalSimulationTarget: "ยอดเป้าหมาย",
    goalSimulationMonths: "จำนวนเดือน",
    goalSimulationAIRecommendation: "คำแนะนำจาก AI",
    goalSimulationScenario: "สถานการณ์จำลอง",
    goalSimulationModerateGrowth: "เติบโตปานกลาง",
    goalSimulationAggressiveSave: "ออมเชิงรุก",
    goalSimulationRelaxedPace: "ออมแบบผ่อนคลาย",
    goalSimulationMonthlyContribution: "ยอดเก็บออมรายเดือน",
    goalSimulationProjectedTimeline: "ระยะเวลาประเมิน",
    goalSimulation24Months: "ประมาณการในอีก 24 เดือน",
    goalSimulationRun: "เริ่มการจำลอง",
    goalSimulationSimulating: "กำลังประมวลผลการจำลอง...",
    goalSimulationProjectedValue: "มูลค่าประเมินในอนาคต",
    goalSimulationTimeToGoal: "เวลาที่จะบรรลุเป้าหมาย",
    goalSimulationAIInsight: "มุมมองเชิงลึกจาก AI",
    goalSimulationUnlockAdvanced: "ปลดล็อกการจำลองขั้นสูง",
    goalSimulationUnlockAdvancedDesc: "เข้าถึงการจำลองการเงินขั้นสูง การติดตามหลายเป้าหมายพร้อมกัน และการเปรียบเทียบสถานการณ์ด้วย AI",
    goalSimulationUpgradeElite: "อัปเกรดเป็นระดับ Elite",
    goalSimulationComplete: "Complete",
    goalSimulationNow: "ขณะนี้",
    goalSimulationReturn: "return",

    netWorthHeroLabel: "NET WORTH",
    netWorthPositiveChange: "+$320 from yesterday",
    netWorthNegativeChange: "-$180 from yesterday",
    assetBreakdownTitle: "Assets vs Liabilities",
    quickAddPlaceholder: "How much did you spend?",
    aiCategorySuggestion: "AI Suggestion • Confirm",
    underBudgetProgress: "Remaining $2,400 until end of month",
    overBudgetProgress: "Over budget this month by 15%...",
    subscriptionWarning3Days: "Charged in 3 days • $299",
    adaptiveFABMessage: "Record your first expense to start behavioral analysis today.",

    // PaywallPage
    paywallHeading: "รับ PicksWise",
    paywallSubheading: "ปลดล็อกศักยภาพทางการเงินของคุณ",
    paywallTogglePro: "PRO",
    paywallToggleElite: "ELITE",
    paywallPerYear: "/ปี",
    paywallPerMonth: "/เดือน",
    paywallSubscribe: "สมัครสมาชิก",
    paywallAutoRenew: "ต่ออายุอัตโนมัติ ยกเลิกได้ทุกเมื่อ",
    paywallWelcome: "ยินดีต้อนรับสู่ Premium!",
    paywallSuccessText: "คุณสามารถใช้งานฟีเจอร์พิเศษได้แล้ว",
    paywallGetStarted: "เริ่มต้นใช้งาน",
    paywallFeatures: "ฟีเจอร์",
    paywallFree: "ฟรี",
    paywallLoading: "กำลังโหลด...",
    paywallScanQr: "สแกน QR เพื่อชำระผ่านพร้อมเพย์",
    paywallScanQrHint: "เปิดแอปธนาคารของคุณแล้วสแกน QR นี้เพื่อชำระเงิน",
    paywallWaitingPayment: "กำลังรอการชำระเงิน...",
    paywallQrExpiresIn: "QR หมดอายุในอีก",
    paywallPaymentFailed: "ชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง",
    paywallBack: "ย้อนกลับ",
    paywallQrExpired: "QR หมดอายุแล้ว",
    paywallTryAgain: "ลองอีกครั้ง",

    // Subscription Shadow Page
    subscriptionShadowTitle: "เงาการสมัคร",
    subscriptionShadowSubtitle: "ชั้นข้อมูลทางการเงิน",
    subShadowAddBtn: "เพิ่ม",
    subShadowMonthly: "รายเดือน",
    subShadowTotalRecurring: "รวมค่าสมัคร",
    subShadowYearly: "รายปี",
    subShadowProjectedAnnual: "คาดการณ์รายปี",
    subShadowThisWeek: "สัปดาห์นี้",
    subShadowCharges: "รายการ",
    subShadowActiveCount: "ใช้งาน",
    subShadowActiveLabel: "การสมัคร",
    subShadowAllFilter: "ทั้งหมด",
    subShadowPausedFilter: "พักการใช้งาน",
    subShadowCancelledFilter: "ยกเลิกแล้ว",
    subShadowSortLabel: "เรียง:",
    subShadowSortNextBilling: "วันตัดถัดไป",
    subShadowSortAmount: "จำนวนเงิน",
    subShadowSortName: "ชื่อ",
    subShadowNoSubs: "ยังไม่มีการสมัคร",
    subShadowNoSubsDesc: "เริ่มติดตามการชำระเงินประจำเพื่อความชัดเจนทางการเงินของคุณ",
    subShadowAddFirst: "เพิ่มการสมัครแรก",
    subShadowDueToday: "วันนี้",
    subShadowTomorrow: "พรุ่งนี้",
    subShadowDays: "วัน",
    subShadowNextBillingDate: "วันตัดถัดไป",
    subShadowLastUsed: "ใช้งานล่าสุด",
    subShadowFrequency: "ความถี่",
    subShadowAnnualCost: "ค่าใช้จ่ายรายปี",
    subShadowCancelBtn: "ยกเลิกการสมัคร",
    subShadowReactivateBtn: "เปิดใช้งานอีกครั้ง",
    subShadowDeleteBtn: "ลบ",
    subShadowCategoryBreakdown: "แยกตามหมวดหมู่",
    subShadowUpcomingCharges: "รายการจะถูกตัดเร็ว ๆ นี้",
    subShadowNoChargesThisWeek: "ไม่มีรายการในสัปดาห์นี้",
    subShadowAiInsightTitle: "ข้อมูลเชิงลึก AI",
    subShadowSavingsPotential: "ศักยภาพการประหยัดรายเดือน",
    subShadowAddModalTitle: "เพิ่มการสมัคร",
    subShadowAddModalDesc: "ติดตามการชำระเงินประจำ",
    subShadowServiceName: "ชื่อบริการ",
    subShadowBillingCycle: "รอบการตัดบัญชี",
    subShadowCategory: "หมวดหมู่",
    subShadowNextBillingOptional: "วันตัดถัดไป (ไม่บังคับ)",
    subShadowCalendarTab: "มุมมองปฏิทิน",
    subShadowListTab: "มุมมองรายการ",
    subShadowConciergeTitle: "ผู้ช่วยการยกเลิก",
    subShadowConciergeDesc: "ให้ PicksWise ช่วยยกเลิกบริการอัตโนมัติ หรือดำเนินการด้วยตนเอง:",
    subShadowConciergeBtn: "ให้ AI ยกเลิกบริการ",
    subShadowCancelPhone: "โทรศัพท์",
    subShadowCancelEmail: "อีเมล",
    subShadowCancelWeb: "เว็บไซต์",
    subShadowViewCancelInstructions: "ดูคู่มือการยกเลิก",
    subShadowUpcomingTab: "รายการถัดไป",
    subShadowAllTab: "ทั้งหมด",
    subShadowComingUpCardTitle: "รายการเร็วๆ นี้",
    subShadowLeftToPay: "ยอดค้างชำระเดือนนี้",
    subShadowActiveSubscriptions: "บริการที่เปิดใช้งาน",
    subShadowPredictiveAmount: "คาดการณ์",
    subShadowSkipThisMonth: "ข้ามเดือนนี้",
    subShadowEditAmount: "แก้ไขยอดเงิน",
    subShadowMarkAsCancelled: "ทำเครื่องหมายว่ายกเลิกแล้ว",
    subShadowSharedWith: "แชร์ค่าใช้จ่ายกับ",
    subShadowPriceHiked: "ราคาปรับขึ้น",
    subShadowPaidThisMonth: "ชำระแล้วในเดือนนี้",
    subShadowUpcomingBills: "บิลที่กำลังมาถึง",
    subShadowMicroBilling: "บิลรายย่อย",
    subShadowLinkedTo: "ชำระผ่าน",

    // AI Coach Section
    aiCoachTitle: "AI Coach",
    aiCoachSummary: "สรุปสั้น ๆ: ค่าใช้จ่ายครึ่งเดือนนี้สูงกว่าปกติ และแนะนำให้ลดค่าใช้จ่ายที่ไม่จำเป็น 2 รายการ",

    // Campaign CTAs (Tesla-style action buttons)
    ctaAddTransaction: "+ Money Pulse",
    ctaSetBudget: "Set Guardian",
    ctaViewReport: "Read My Story",
    ctaSaveMoney: "Ignite Goal",

    // Campaign Push Notification Labels
    pushGhostDetected: "Ghost Detected",
    pushGuardianAlert: "Guardian Alert",
    pushGoalProgress: "Goal Progress",

    // Slide to Upgrade / SwipeConfirm
    slideUpgrade: "ปลดล็อก",
    slideConfirm: "ปัดเพื่อยืนยัน",
    swipeConfirm: "ปัดเพื่อยืนยัน",

    // Common UI
    commonGoBack: "ย้อนกลับ",
    commonInfo: "ข้อมูล",

    // Profile Settings Page
    profileTitle: "โปรไฟล์",
    profileDefaultsName: "ชื่อของคุณ",
    profileSetupComplete: "ตั้งค่าเสร็จแล้ว",
    profileEditProfileAria: "แก้ไขโปรไฟล์",
    profileEditNamePrompt: "แก้ไขชื่อ:",
    profileEditEmailPrompt: "แก้ไขอีเมล:",
    profileLogOut: "ออกจากระบบ",

    // Bottom Navigation
    bottomNavNavigation: "การนำทางหลัก",
  }
};
