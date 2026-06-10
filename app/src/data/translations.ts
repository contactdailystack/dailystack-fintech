﻿export type Language = 'en' | 'th';

export interface TranslationDict {
  // Navigation tabs
  dashboardTab: string;
  radarTabMenu: string;
  insightsTab: string;
  storiesTab: string;
  settingsTab: string;

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
  baseCurrencyThai: string;
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
  radarHighIndex: string;
  tacticalEngine: string;
  readyReasoning: string;
  infiniteMemory: string;
  chatPlaceholder: string;
  chatFallbackSave: string;
  chatFallbackInvest: string;
  chatFallbackImpulse: string;
  chatFallbackDefault: string;
  chatProcessing: string;

  // Insights / Analytics Screen
  valueInsightsTitle: string;
  valueInsightsSub: string;
  analyticsTab: string;
  behaviorTab: string;
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
  emotionalIndex: string;
  whySovereignSpend: string;
  whySovereignSpendDesc: string;
  triggerLimitText: string;
  triggerHighText: string;
  diagnosticTitle: string;
  copingAssessment: string;
  copingAssessmentText1: string;
  copingAssessmentText2: string;
  wantCompleteGraph: string;
  wantCompleteGraphDesc: string;

  // Storyboard Screen
  weeklyNarrative: string;
  lockCtaBtn: string;
  premiumSovereignActive: string;
  verifiedLedger: string;
  prevStoryboard: string;
  nextStoryboard: string;
  indexIndicator: string;

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

    // Money Twin Blueprint Page
    moneyTwinTitle: string;
    moneyTwinSub: string;
    moneyTwinYourTwin: string;
    moneyTwinLevel: string;
    moneyTwinStreak: string;
    moneyTwinArchetype: string;
    moneyTwinTwinRadar: string;
    moneyTwinCurrentVsIdeal: string;
    moneyTwinCurrent: string;
    moneyTwinIdeal: string;
    moneyTwinPredictionEngine: string;
    moneyTwinPredictionSub: string;
    moneyTwinRecommendations: string;
    moneyTwinEvolution: string;
    moneyTwinEliteFeature: string;
    moneyTwinEliteDesc: string;
    moneyTwinUnlockElite: string;
    moneyTwinAllGood: string;
    moneyTwinBasicPreview: string;
    moneyTwinProActive: string;
    moneyTwinProDesc: string;
  }

export const translations: Record<Language, TranslationDict> = {
  en: {
    dashboardTab: "Decision Center",
    radarTabMenu: "Money Twin",
    insightsTab: "Insights",
    storiesTab: "Stories",
    settingsTab: "More",

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
        { title: "Control Impulse Spending", subtitle: "Manage emotional and behavioral triggers" },
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
        title: "Enter the Behavior Intelligence Era",
        desc: "Stop logging transactions. Categorize emotional buying indicators like Impulse, Stress-Release, and Social Pressure. Know exactly WHY your money leaves.",
        statsVal: "-38.2%",
        statsLabel: "Reduced Unplanned Regrets"
      },
      {
        title: "Your Dynamic Weekly Money Narrative",
        desc: "Get stories, not numbers. Our AI digest compiles your cash behaviors into gorgeous storyboards, mapping future asset returns against current micro-rewards.",
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
    loginSub: "Experience high-end wealth intelligence designed for complete financial confidence.",
    emailId: "EMAIL ID OR ACCOUNT",

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
    baseCurrencyThai: "Thai Baht (THB)",
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
    radarHighIndex: "You index 2.4x higher than standard generational patterns in capital protection metrics.",
    tacticalEngine: "TACTICAL ADVISORY ENGINE",
    readyReasoning: "ONLINE READY • ADVANCED REASONING LOADED",
    infiniteMemory: "Get Infinite Memory",
    chatPlaceholder: 'Ask: "Why do I suffer unplanned spending spikes?" or "Establish a budget plan"',
    chatFallbackSave: "As a {archetype}, your core future confidence relies on structured systems. I recommend establishing an autonomous '10% core multiplier' where that portion of every incoming settlement bypasses your retail accounts and settles instantly into MSFT or treasury classes. This mitigates mid-week dopamine leakages.",
    chatFallbackInvest: "We see extreme demographic stability in Apple (AAPL) and NVIDIA (NVDA) positions inside your current profile. To maximize compound momentum, focus 80% on these system anchors, and contain speculative micro-plays under a strict 4% emotional playground limit.",
    chatFallbackImpulse: "Our analysis confirms Wednesday evenings are your highest risk timeframe due to accumulated cortisol spikes triggering minor hardware gadgets and fine dining purchases. Establish a 24-hour 'cooling lock-out' rule specifically for these hours. Delaying purchase execution by 24 hours destroys 91% of impulse urges instantly.",
    chatFallbackDefault: "Interesting strategic query. In alignment with your {archetype} blueprint, we must protect your future capital integrity by prioritizing stability. I recommend examining your socializing expenditure next week to filter out transactional casual acquaintances. What specifically triggers your buying dopamine today?",
    chatProcessing: "Cognitive agent is processing behavioral calibrations...",

    valueInsightsTitle: "Value & Behavior Insights",
    valueInsightsSub: "PSYCHOLOGICAL LEDGER & PATTERN CALIBRATION",
    analyticsTab: "Analytics Overview",
    behaviorTab: "Behavior Intelligence",
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
    emotionalIndex: "EMOTIONAL BUYING INDEX",
    whySovereignSpend: "Why do I spend money?",
    whySovereignSpendDesc: "DailyStack maps your psychological state to every outbound settlement. This highlights dopamine triggers, social pressures and stress vulnerabilities.",
    triggerLimitText: "Limit Recommended",
    triggerHighText: "High alignment",
    diagnosticTitle: "BEHAVIORAL DIAGNOSTIC",
    copingAssessment: "Your Coping-Economy Assessment",
    copingAssessmentText1: "You cleared {impulseCount} unplanned impulses and {stressCount} stress-mitigating payments this session context.",
    copingAssessmentText2: "Insight Agent report: Wednesday nights generate high work pressure, which frequently triggers minor technological hardware purchases. Rerouting this behavior into active physical recreation or meditation would secure you roughly $2,640 of autonomous yearly savings.",
    wantCompleteGraph: "WANT A COMPLETE LIFETIME GRAPH?",
    wantCompleteGraphDesc: "Track emotional correlations across 12+ months securely.",

    weeklyNarrative: "AI Weekly Narrative",
    lockCtaBtn: "Unshackle Future Metrics",
    premiumSovereignActive: "PRO / ELITE tier active",
    verifiedLedger: "100% verified ledger",
    prevStoryboard: "Previous Story",
    nextStoryboard: "Next Story",
    indexIndicator: "INDEX",

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
    budgetTitle: "Budget Management",
    budgetSub: "PLAN & TRACK YOUR SPENDING INTELLIGENTLY",
    budgetOverviewTab: "Overview",
    budgetCategoriesTab: "Categories",
    budgetGoalsTab: "Goals",
    budgetTotalBudget: "Monthly Total Budget",
    budgetSpent: "Spent",
    budgetLeft: "Left",
    budgetDaysLeft: "Days Left",
    budgetAvgDay: "Avg/Day",
    budgetProjected: "Projected",
    budgetOverBudget: "Over Budget",
    budgetNearLimit: "Near Limit",
    budgetMonthlyTrend: "Monthly Trend",
    budgetAIRecommendation: "AI Recommendation",
    budgetSetCoolRule: "Set Cooling Rule",
    budgetAddCategory: "Add New Category",
    budgetEditCategory: "Edit Category",
    budgetCategoryName: "Category Name",
    budgetMonthlyLimit: "Monthly Budget",
    budgetSave: "Save",
    budgetCancel: "Cancel",
    budgetDeleteCategory: "Delete Category",
    budgetDeleteConfirm: "Are you sure?",
    budgetProgressBar: "Progress",
    budgetOverBudgetAlert: "Over Budget Alert",
    budgetAddFirstBudget: "Add your first budget category",
    budgetNoCategories: "No categories yet",
    budgetUnlockElite: "Unlock with ELITE",
    budgetEliteFeature: "Advanced budget analytics & multi-month trends",
    budgetCreateFirst: "Create Budget",
    budgetAllGoals: "All Goals",

    // Goal Simulation Page
    goalSimulationTitle: "Goal Simulation",
    goalSimulationSub: "Plan your financial future with AI-powered scenarios",
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
    goalSimulationUnlockAdvancedDesc: "Get access to Money Twin projections, multiple goal tracking, and AI-powered scenario comparisons.",
    goalSimulationUpgradeElite: "Upgrade to Elite",
    goalSimulationComplete: "Complete",
    goalSimulationNow: "Now",
    goalSimulationReturn: "return",

    // Money Twin Blueprint Page
    moneyTwinTitle: "Money Twin Blueprint",
    moneyTwinSub: "Your financial twin persona — current vs. ideal state",
    moneyTwinYourTwin: "Your Twin Identity",
    moneyTwinLevel: "Money Twin Level",
    moneyTwinStreak: "streak",
    moneyTwinArchetype: "Archetype",
    moneyTwinTwinRadar: "Twin Radar",
    moneyTwinCurrentVsIdeal: "Current (solid) vs. Ideal (dashed) — fill the gap",
    moneyTwinCurrent: "Current",
    moneyTwinIdeal: "Ideal",
    moneyTwinPredictionEngine: "Twin Prediction Engine",
    moneyTwinPredictionSub: "AI-driven next financial decision forecast",
    moneyTwinRecommendations: "Alignment Recommendations",
    moneyTwinEvolution: "Twin Evolution",
    moneyTwinEliteFeature: "ELITE Feature",
    moneyTwinEliteDesc: "Weekly twin evolution requires ELITE plan.",
    moneyTwinUnlockElite: "Unlock ELITE",
    moneyTwinAllGood: "Your twin is well-aligned! Keep doing what you're doing.",
    moneyTwinBasicPreview: "PREMIUM PREVIEW — 3 of 5 axes shown",
    moneyTwinProActive: "PRO ACTIVE — Full 5-axis radar unlocked",
    moneyTwinProDesc: "Upgrade to ELITE to unlock behavioral predictions and weekly timeline.",
  },
  th: {
    dashboardTab: "ศูนย์การตัดสินใจ",
    radarTabMenu: "Money Twin",
    insightsTab: "ข้อมูลเชิงลึก",
    storiesTab: "นิทัศน์สติการเงิน",
    settingsTab: "เมนูเพิ่มเติม",

    brand: "PicksWise",
    subtitle: "ทุกการตัดสินใจทางการเงินล้วนมีความหมาย",
    reserveVault: "ห้องสำรองสินทรัพย์อัจฉริยะ PicksWise",
    portfolioTitle: "พอร์ตโฟลิโอการตัดสินใจ",
    totalPortfolio: "มูลค่าการจัดสรรการตัดสินใจรวม",
    growthLabel: "+14.31% การเติบโตเชิงรุก",
    assetPerformance: "ผลตอบแทนจากการตัดสินใจที่ชาญฉลาด",
    liveFeed: "ฟีดบริบทการวิเคราะห์การตัดสินใจสดเรียลไทม์",
    sparksLabel: "ประกายการตัดสินใจใน 30 วัน",
    recentLedger: "บัญชีแยกประเภทการตัดสินใจเชิงรอบคอบ",
    ledgerSub: "สรุปการตัดสินใจขาเข้าและขาออกแบบเรียลไทม์",
    searchPlaceholder: "ค้นหาการตัดสินใจและมาตรการ...",
    noRecords: "ไม่พบข้อมูลการตัดสินใจที่ตรงกับเกณฑ์",
    coreBalance: "ยอดสมดุลงบหลักสำรอง",
    deposit: "ฝากสัดส่วน",
    withdraw: "ดึงยอดคืน",
    transfer: "เบี่ยงทิศทางออก",
    getPremium: "ปลดล็อกเว่อร์ชัน 5.2 พรีเมียม",
    sovereignVerified: "การตัดสินใจเชิงอธิปไตยผ่านการรับรอง",
    legalName: "ความปลอดภัยของสิทธิ์ตัวตนแท้จริง",
    commsRoute: "เส้นทางการวิเคราะห์เชิงพฤติกรรมทันที",
    terminateSession: "ยุติเซสชั่นการทำงานเพื่อความปลอดภัย",
    commitSpecs: "อัปโหลดข้อระบุระบบหลัก",
    premiumOS: "ระบบการออกแบบเว่อร์ชัน 5.2 OS",
    coreLevel: "ระดับบริการพื้นฐาน PicksWise",
    currentOperationalTier: "ระดับการรับรองสถิติการตัดสินใจ",
    currentOperationalTierDesc: "แผนการสมัครสมาชิกที่ใช้งานอยู่และระดับการเข้าถึงฟีเจอร์ปัจจุบันของคุณ",
    freeTierPitch: "คุณกำลังดำเนินงานบนโหนดพฤติกรรมเสรีทั่วไปโดยไม่มีการคาลิเบรตประสิทธิภาพสูง ตัวตนดิจิทัล Twin, แผนที่นำทางแห่งอนาคต และคลังการตัดสินใจระดับอนันต์ยังถูกระงับสิทธิ์",
    activateLuxury: "เปิดใช้ระบบตัดสินใจอธิปไตยพรีเมียมทันที",
    secureEncryptionTitle: "สถาปัตยกรรมแยกความปลอดภัยความมั่นคงแซนด์บ็อกซ์",
    secureEncryptionPitch: "รายละเอียดบัญชี PicksWise ของคุณได้รับการปกป้องเป็นความลับแยกต่างหากในสภาพแวดล้อม Client Sandbox ของอุปกรณ์ผู้ใช้ ตัวแปรวิเคราะห์ภายในสอดคล้องกับมาตรฐานความปลอดภัย ไม่แชร์ข้อมูลเพื่อการจัดส่งโฆษณาภายนอก",
    yearsOfAutonomousCapital: "ชุดการตัดสินใจทางการเงินที่ฉลาดขึ้นเหล่านี้จะจัดตั้งทุนอิสระมูลค่า $84k ในอนาคต",

    introductionSkip: "ข้ามคำแนะนำแนะนำระบบ",
    moduleLabel: "โมดูลย่อย",
    luxurySystem: "อุปกรณ์อัจฉริยะลักชัวรี",
    immediateImpact: "ผลลัพธ์เชิงบวกทันที",
    averageWeeklySavings: "ตัวแปรประหยัดเฉลี่ยปรับขึ้น",
    reducedRegret: "ประเมินแล้วลดความเสียใจเรื่องใช้จ่ายไร้ประโยชน์",
    pathFreedom: "ความคล่องตัวระบบการเงินอิสระ",
    commitmentTitle: "ปฏิญญาความมุ่งมั่น",
    commitmentSubtitle: "มอบสัญญาต่อการเปลี่ยนแปลงทางการเงินของคุณ",
    commitmentStatement: "ข้าพเจ้าตระหนักว่าความเป็นเจ้าของทางการเงินเริ่มต้นจากวินัยและการตระหนักรู้ ข้าพเจ้าขอสัญญาว่าจะใช้งาน DailyStack อย่างซื่อสัตย์ ติดตามพฤติกรรมอย่างสม่ำเสมอ และเคารพระบบที่เคารพข้าพเจ้า",
    commitmentConfirm: "ข้าพเจ้ามุ่งมั่นในเส้นทางนี้",
    commitmentDecline: "ต้องการเวลาเพิ่มเติม",
    nextStep: "ความสามารถถัดไปของอุปกรณ์",
    financialChallenge: {
      question: "คุณกำลังเผชิญความท้าทายทางการเงินอะไร?",
      options: [
        { title: "ออมเงินให้มากขึ้น", subtitle: "ลดการใช้จ่ายที่ไม่จำเป็นและสร้างเงินสำรอง" },
        { title: "ติดตามทุกการใช้จ่าย", subtitle: "เห็นชัดว่าเงินไปไหนทั้งหมด" },
        { title: "ควบคุมการซื้อหวั่นไหว", subtitle: "จัดการตัวกระตุ้นทางอารมณ์และพฤติกรรม" },
        { title: "สร้างความมั่งคั่งระยะยาว", subtitle: "เติบโตของสินทรัพย์และวางแผนอนาคต" }
      ]
    },
    onboardingSteps: [
      {
        title: "ติดตามการใช้จ่ายอย่างง่ายดายไร้กังวล",
        desc: "จัดการกระแสการเงินของคุณด้วยอินเตอร์เฟสผู้รักษาที่เข้าใจง่ายอย่างเป็นธรรมชาติ ตั้งเกณฑ์เกราะกำบัง วิเคราะห์ทางจิตวิทยา และเข้าถึงการสะสมกำไรสติรวดเร็ว",
        statsVal: "+24.6%",
        statsLabel: "ตัวแปรประหยัดเฉลี่ยปรับขึ้น"
      },
      {
        title: "ความท้าทายทางการเงินหลัก",
        desc: "เลือกเป้าหมายที่สำคัญที่สุดสำหรับคุณในตอนนี้",
        statsVal: "1 / 5",
        statsLabel: "เลือกหนึ่งข้อ",
        type: "challenge"
      },
      {
        title: "ก้าวสู่ยุคพฤติกรรมข้อมูลอัจฉริยะ",
        desc: "หยุดกรอกตัวเลขแบบดั้งเดิม แยกประเภทอารมณ์ที่กำหนดการใช้จ่าย เช่น ความวู่วาม ความเครียดสะสม และแรงกดดันทางสังคม รู้แน่ชัดว่าทำไมเงินถึงรั่วไหลออกไป",
        statsVal: "-38.2%",
        statsLabel: "ประเมินแล้วลดความเสียใจเรื่องใช้จ่ายไร้ประโยชน์"
      },
      {
        title: "เรื่องเล่ากระแสเงินส่วนตัวรายสัปดาห์",
        desc: "รับชมเรื่องเล่าแทนตารางวิเคราะห์ดาดๆ เทพปัญญาประดิษฐ์ของเราสรุปพฤติกรรมทางการเงินของคุณเป็นสตอรี่บอร์ดแสนหรูหรา เชื่อมต่อมูลค่าในอนาคตเทียบกับความสุขชั่วคราว",
        statsVal: "เสร็จสิ้นเร็วขึ้น 2 เท่า",
        statsLabel: "ความคล่องตัวถึงเป้าหมายทางการเงินเสรี"
      },
      {
        title: "ปฏิญญาความมุ่งมั่น",
        desc: "มอบสัญญาต่อการเปลี่ยนแปลงทางการเงินของคุณ",
        statsVal: "ขั้นตอนที่ 5",
        statsLabel: "คำมั่นสัญญาขั้นสุดท้าย"
      }
    ],

    launchOS: "เปิดตัวระบบ",

    secureFinOS: "ระบบความปลอดภัยทางการเงินเชิงลึก",
    loginSub: "สัมผัสความชาญฉลาดด้านการเงินชั้นสูง เพื่อความมั่นใจอย่างสมบูรณ์แบบในอนาคตผู้พิทักษ์",
    emailId: "ที่อยู่อีเมล หรือรหัสประจำบัญชี",

    // OTP Screen
    otpTitle: "ยืนยันอีเมลของคุณ",
    otpSubtitle: "เราได้ส่งรหัสยืนยันไปยัง",
    otpEnterCode: "ใส่รหัส 6 หลัก",
    otpVerifyBtn: "ยืนยันอีเมล",
    otpResendQuestion: "ไม่ได้รับรหัส?",
    otpResendIn: "ส่งใหม่ใน",
    otpResend: "ส่งรหัสใหม่",
    otpBack: "← กลับไปหน้าล็อกอิน",
    otpSuccessTitle: "ยืนยันอีเมลสำเร็จ!",
    otpSuccessVerify: "ยืนยันอีเมลสำเร็จ!",
    otpSuccessReset: "รีเซ็ตรหัสผ่านสำเร็จ!",
    otpSuccessVerifySub: "อีเมลของคุณได้รับการยืนยันแล้ว ยินดีต้อนรับสู่ PicksWise!",
    otpSuccessResetSub: "ตอนนี้คุณสามารถตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณได้แล้ว",
    otpContinueBtn: "ไปยังหน้าหลัก",
    otpResetPasswordBtn: "ตั้งรหัสผ่านใหม่",
    otpSecureVerification: "การยืนยันความปลอดภัย",
    otpInvalidError: "รหัสยืนยันไม่ถูกต้อง กรุณาลองอีกครั้ง",
    otpFailedError: "การยืนยันล้มเหลว กรุณาลองอีกครั้ง",
    otpResendError: "ส่งรหัสใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง",
    password: "รหัสเข้าใช้งานส่วนบุคคล (PASSWORD)",
    forgot: "ลืมรหัสผ่าน?",
    enterOS: "เข้าสู่ระบบปฏิบัติการการเงินส่วนตัว",
    initAccount: "เริ่มสร้างและลงทะเบียนเสาหลักกระเป๋า",
    orMaster: "หรือเข้าผ่านช่องทางพาร์ทเนอร์หลัก",
    appleCard: "บัตร Apple Card",
    googleCloud: "บัญชี Google Cloud",
    alreadyEngineered: "ลงทะเบียนติดตั้งเสร็จเรียบร้อยแล้ว?",
    newToDailyStack: "เพิ่งเคยสัมผัสเทคโนโลยี DailyStack ใช่หรือไม่?",
    loginCore: "เข้าใช้งานโหมดกระเป๋าหลัก",
    registerSecurely: "ติดตั้งรักษาสิทธิปลอดภัยสูงสุด",
    bankSecured: "คุ้มครองเครือข่ายด้วยระบบถอดรหัสระดับ AES-256",


    // Base Currency Selection
    baseCurrencyTitle: "เลือกสกุลเงินหลักของคุณ",
    baseCurrencySub: "เลือกสกุลเงินหลักสำหรับการคำนวณและติดตามทั้งหมด",
    baseCurrencySelect: "เลือกสกุลเงิน",
    baseCurrencyConfirm: "ยืนยันสกุลเงิน",
    baseCurrencyThai: "บาทไทย (THB)",
    baseCurrencyUsd: "ดอลลาร์สหรัฐ (USD)",
    baseCurrencyEur: "ยูโร (EUR)",
    baseCurrencyGbp: "ปอนด์สเตอร์ลิง (GBP)",
    baseCurrencyJpy: "เยนญี่ปุ่น (JPY)",
    baseCurrencySgd: "ดอลลาร์สิงคโปร์ (SGD)",
    identityRadar: "การวิเคราะห์เรดาร์ระบุตัวตน",
    coreSignature: "รหัสระบุเอกลักษณ์พฤติกรรมทางการเงินขั้นพื้นฐาน",
    confidenceScore: "คะแนนความถูกต้องแม่นยำในการถอดสัญชาตญาณ",
    biometricIndicators: "ตัวบ่งชี้ชีวมาตรทางการเงินขั้นสูง",
    calibrationsTitle: "ระดับการตั้งค่าสมรรถนะการใช้สมองทางการเงิน",
    impulseRating: "ดัชนีแรงขับแรงดึงดูดของอารมณ์ชั่วคราว (Dopamine)",
    futureHorizon: "วิสัยทัศน์และการเล็งผลเป้าหมายระยะยาว",
    socialDefense: "เกราะป้องกันการกดดันและล่อลวงทางสังคม",
    valueSeeking: "การพยายามแสวงหาความคุ้มค่าที่คำนวณแล้วอย่างถี่ถ้วน",
    radarHighIndex: "คะแนนเกราะประหยัดเพื่อความมั่นคงระยะยาวของคุณสูงกว่าเกณฑ์สถิติดิจิทัลเฉลี่ยของภูมิภาคถึง 2.4 เท่าตัว",
    tacticalEngine: "ระบบที่ปรึกษากลยุกต์ปัญญาประดิษฐ์",
    readyReasoning: "ระบบอัจฉริยะออนไลน์พร้อมทำงาน • ข้อมูลตรรกะระดับสูงถูกคาลิเบรตเรียบร้อย",
    infiniteMemory: "อัปเกรดระบบจัดเก็บความจำถาวร",
    chatPlaceholder: 'ลองถาม: "ทำไมฉันมักจะเผลอใจจ่ายเงินซื้อของเล่นแบบกะทันหันบ่อยครั้ง?" หรือ "ช่วยทำแผนงบความสุขให้ที"',
    chatFallbackSave: "ในฐานะนักใช้จ่ายประเภท {archetype} หลักคิดพื้นฐานในการรักษาตัวตนอนาคตของคุณขึ้นอยู่กับการสร้างกลไกขับเคลื่อน แนะนำให้จัดตั้ง 'ตัวคูณเงินเก็บ 10% อัตโนมัติ' ซึ่งระบบจะดึงยอดนี้ส่งเข้าไปลงทุนในหุ้นเสาหลักเช่น MSFT หรือคลังทันที ช่วยป้องกันสภาวะสารเสพติดความสุขใจแตกช่วงกลางสัปดาห์ได้อย่างดี",
    chatFallbackInvest: "เราพบว่าสัดส่วนของ Apple (AAPL) และ NVIDIA (NVDA) ในระบบของคุณมีความมั่นคงทางการค้าสูงมาก แนะนำให้เน้นการถือสัดส่วนเสาหลักเหล่านี้ 80% และจำกัดความเสี่ยงไปกับทางเลือกที่มีความแปลกใหม่ทางอารมณ์ไม่เกิน 4% เพื่อความปลอดภัยสูงสุด",
    chatFallbackImpulse: "ผลการวิเคราะห์ยืนยันว่าเย็นวันพุธเป็นช่วงเวลาที่มีรอยรั่วความเสี่ยงสูงที่สุดเนื่องจากความเหนื่อยล้าสะสม แนะนำให้ตั้งกฎ 'แช่เย็นชะลอกาย 24 ชั่วโมง' เป็นเกราะสำหรับสินค้าฟุ่มเฟือย ชะลอการจ่ายเพียงวันเดียวจะลดอาการอยากลงได้ถึง 91%",
    chatFallbackDefault: "คำถามที่ดีมากตามหลักสมองผู้ซื้อแบบ {archetype} เราต้องปกป้องสิทธิภาพรวมของสมดุลการเงินด้วยความรอบคอบ แนะนำให้ทบทวนความคุ้มค่าในหมวดการเที่ยวเล่นสังคมกับคนรู้จักห่างๆ ในสัปดาห์หน้า อะไรเป็นสิ่งดึงดูดใจหลักในการซื้อสินค้าของคุณวันนี้?",
    chatProcessing: "วิเคราะห์พฤติกรรมและคาลิเบรตความแม่นยำทางจิตวิทยาการเงิน...",

    valueInsightsTitle: "ข้อมูลเชิงลึกในพฤติกรรมและความคุ้มค่า",
    valueInsightsSub: "การถอดรหัสบัญชีแยกประเภททางจิตวิทยาและการประเมินสัดส่วน",
    analyticsTab: "ภาพรวมสถิติตัวเลข",
    behaviorTab: "บทวิเคราะห์สติปัญญาทางอารมณ์",
    spendCalculation: "การคำนวณสัดส่วนกระแสเงินออกรวม",
    spendSub: "ความเสียใจและมูลค่าการใช้จ่ายที่เก็บบันทึกสะสม",
    categoryDensity: "สัดส่วนความเข้มข้นของการเลือกซื้อรายหมวดหมู่",
    radarRevelation: "จุดกำเนิดพฤติกรรมเรดาร์ค้นพบข้อมูลสำคัญ",
    dopamineOutflows: "ได้รับการควบคุมพฤติกรรมปล่อยสารจ่ายความสุข",
    impulseDecreasedText: "สัดส่วนความวู่วามของคุณลดตัวลงเป็นบวก 12.4% ในรอบสัปดาห์นี้ การปรับกระแสไปลงทุนตรงกลุ่มสินทรัพย์เพิ่มมูลค่า ช่วยให้ประหยัดพลังงานตัวเงินได้กว่า $340.00 และเดินหน้าทำกำไรทบต้นแล้ว",
    topRegulatedClass: "กลุ่มหมวดหมู่ที่มีผลงานการระงับใจยอดเยี่ยม: อุปกรณ์เทคโนโลยีส่วนเกิน",
    deepCoreTitle: "ระบบสแกนเอกลักษณ์แกนสมองผู้จ่ายแบบรอบด้าน",
    deepCoreSub: "คลิกเพื่อปลดล็อกสตอรี่วิเคราะห์อนาคตของตัวเอกลักษณ์คุณล่วงหน้า",
    upgradeFutureOS: "สมัครทดสอบแผนรับใช้ระบบปฏิบัติการส่วนตัว",
    emotionalIndex: "ดัชนีระดับอารมณ์ที่เข้ามาสร้างผลกระทบต่อรายการใช้จ่าย",
    whySovereignSpend: "พวกเราทำเงินออกไปด้วยสารสมองชนิดใด?",
    whySovereignSpendDesc: "DailyStack จับคู่สถานะจิตสำนึกของคุณต่อทุกรายการบัญชีแยกประเภทภายนอก ทำให้ค้นพบจุดเร้าทางอารมณ์ แรงกดกันกลุ่มเพื่อน และความเปราะบางยามเมื่อยล้าสะสม",
    triggerLimitText: "ข้อแนะนำการควบคุมเป็นกรณีพิเศษ",
    triggerHighText: "สัดส่วนพฤติกรรมเชิงบวกเป็นปกติสุข",
    diagnosticTitle: "การตรวจสอบวินิจฉัยทางการแพทย์การเงินของปัญญาประดิษฐ์",
    copingAssessment: "บทสรุปประเมินสภาวการณ์ใช้จ่ายเพื่อระบายภาวะกดดันภายนอก",
    copingAssessmentText1: "คุณสามารถระงับความเสี่ยงจากเหตุวู่วามได้ {impulseCount} ครั้ง และผ่านพ้นวิกฤตการใช้จ่ายชดเชยระดับความเครียดสะสมได้ {stressCount} รายการในเซสชั่นประมวลผลนี้",
    copingAssessmentText2: "รายงานสรุปของผู้ตรวจการสติ: ค่ำคืนวันพุธเป็นช่วงวิกฤตก่อความเครียดหนาแน่น มักดึงใจให้มองหาเทคโนโลยีตอบสนองชั่วคราว การเปลี่ยนย้ายเวลาไปพึ่งพาการออกกำลังกายหรือการฟื้นฟูจิตใจจะเพิ่มขีดความสามารถการเก็บออมทุนส่วนตัวกว่า $2,640 ต่อปีสะสม",
    wantCompleteGraph: "ต้องการดูรากฐานและเส้นพัฒนาทางอารมณ์เต็มสเกลหรือไม่?",
    wantCompleteGraphDesc: "เฝ้าระวังอัตราสถิติความเชื่อมโยงของผลอารมณ์และสติการถือครองยาวนาน 12+ เดือน",

    weeklyNarrative: "ข้อมูลนิทัศน์รายสัปดาห์ปัญญาประดิษฐ์",
    lockCtaBtn: "เปิดขอบเขตวิเคราะห์ตัวชี้วัดความคล่องตัวทั้งหมด",
    premiumSovereignActive: "บัญชี PRO / ELITE เปิดทำงาน",
    verifiedLedger: "บัญชีรายรับรายจ่ายผ่านการตรวจมาตรฐานสากลแล้ว 100%",
    prevStoryboard: "ย้อนกลับ",
    nextStoryboard: "ขั้นตอนถัดไป",
    indexIndicator: "รหัสดัชนี",

    assetAnalysis: "ระบบถอดโครงสร้างพฤติกรรมข้อมูลหลักทรัพย์ชั้นสูง",
    unitSharePrice: "ราคาเฉลี่ยต่อหน่วยสัดส่วนมูลค่า",
    percentageMetric: "อัตราตัววัดผลงานผลตอบแทนเปอร์เซ็นต์",
    chartFluctuations: "รายงานสรุปวิวัฒนาการทิศทางในระยะเวลา 30 วัน",
    sellPosition: "ขายครองหุ้นออก",
    acquireShares: "เข้าสะสมเพิ่มเติม",
    simulatedSell: "ระบบได้ทำการทดสอบจำลองรายการขายของป้าย {symbol} สำเร็จ ช่องทางเชื่อมต่อแลกเปลี่ยนภายนอกพร้อมดูแลคุณสมบูรณ์แบบบน Premium OS เท่านั้น",
    simulatedBuy: "ระบบได้ทำการทดสอบจำลองกระบวนการเข้าซื้อของป้าย {symbol} สำเร็จ พอร์ตและสะพานตลาดโลกเปิดพร้อมใช้งานครบกระบวนการบน Premium OS เท่านั้น",

    inboundVault: "ฝากสินทรัพย์เข้าบัญชีรักษาการ",
    outboundVault: "ถอนกระแสเสรีออกจากระบบห้องสำรอง",
    externalWallet: "โอนออกไปยังกระเป๋าเงินพาร์ทเนอร์ปลายทาง",
    recipientRouting: "รหัสบัตรหรือกระเป๋าปลายทางผู้รักษาเพื่อทำธุรกรรมโอน",
    transactionCost: "มูลค่าในการทำรายการ ($ สหรัฐอเมริกา)",
    actionAmountError: "กรุณาระบุมูลค่าตัวเลขจำนวนเงินที่ถูกต้องแม่นยำเกินกว่าศูนย์เท่านั้น",
    withdrawError: "ไม่พบกระแสยอดเงินคงเหลือกระเป๋าหลักรองรับการถอนจำนวนนี้",
    transferError: "ไม่พบสัดส่วนยอดเงินคงเหลือเพียงพอต่อกระบวนการพิจารณาเป้าหมายที่โหนดคอยน์",
    transferRecipientError: "กรุณาระบุรหัสบัญชีหรือข้อมูลผู้รับเงินปลายทางอย่างชัดเจนกุมสิทธิ",
    depositSuccess: "ทำการปกป้องฝากเข้าระบบสำรองสำเร็จยอด +${amount}",
    withdrawSuccess: "ทำการถอนสินทรัพย์ออกจากห้องนิรภัยเรียบร้อยแล้วยอด -${amount}",
    transferSuccess: "ได้ทำเรื่องโอนกระแสสินทรัพย์ยอด -${amount} ไปถึงปลายทางรหัส {recipient} สำเร็จ",
    executeProtocol: "ยืนยันการอนุมัติธุรกรรมความปลอดภัยขั้นสูงสุด",
    quickActionPrompt: "ได้รับการยืนยันการตั้งค่าจากคีย์บอร์ดความเร็วสูง",

    alternativeVaultTitle: "ตู้นิรภัยสินทรัพย์ทางเลือก",
    alternativeVaultSub: "วิเคราะห์พฤติกรรมการลงทุนในสินทรัพย์ทางเลือก",
    alternativeAddAsset: "เพิ่มสินทรัพย์ใหม่",
    alternativeEditAsset: "แก้ไขรายละเอียดสินทรัพย์",
    alternativeDeleteAsset: "ลบสินทรัพย์",
    alternativeTotalValue: "มูลค่ารวม",
    alternativeTotalPL: "กำไร/ขาดทุน",
    alternativeAvgReturn: "ผลตอบแทนเฉลี่ย",
    alternativeNoAssets: "ยังไม่มีสินทรัพย์ทางเลือก",
    alternativeLocked: "ต้องเป็นสมาชิก ELITE",
    alternativeLockedDesc: "ปลดล็อกตู้นิรภัยสินทรัพย์ทางเลือกด้วยแพลน ELITE",

    // Budget Management Page
    budgetTitle: "จัดการงบประมาณ",
    budgetSub: "วางแผนและติดตามการใช้จ่ายอย่างชาญฉลาด",
    budgetOverviewTab: "ภาพรวม",
    budgetCategoriesTab: "หมวดหมู่",
    budgetGoalsTab: "เป้าหมาย",
    budgetTotalBudget: "งบประมาณรวมเดือนนี้",
    budgetSpent: "ใช้ไป",
    budgetLeft: "คงเหลือ",
    budgetDaysLeft: "วันที่เหลือ",
    budgetAvgDay: "เฉลี่ย/วัน",
    budgetProjected: "การคาดการณ์",
    budgetOverBudget: "เกินงบ",
    budgetNearLimit: "ใกล้ถึงขีดจำกัด",
    budgetMonthlyTrend: "แนวโน้มรายเดือน",
    budgetAIRecommendation: "คำแนะนำ AI",
    budgetSetCoolRule: "ตั้งกฎคูลดาวน์",
    budgetAddCategory: "เพิ่มหมวดหมู่ใหม่",
    budgetEditCategory: "แก้ไขหมวดหมู่",
    budgetCategoryName: "ชื่อหมวดหมู่",
    budgetMonthlyLimit: "งบประมาณรายเดือน",
    budgetSave: "บันทึก",
    budgetCancel: "ยกเลิก",
    budgetDeleteCategory: "ลบหมวดหมู่",
    budgetDeleteConfirm: "คุณแน่ใจหรือไม่?",
    budgetProgressBar: "ความคืบหน้า",
    budgetOverBudgetAlert: "แจ้งเตือนเกินงบ",
    budgetAddFirstBudget: "เพิ่มหมวดหมู่งบประมาณแรกของคุณ",
    budgetNoCategories: "ยังไม่มีหมวดหมู่",
    budgetUnlockElite: "ปลดล็อกด้วย ELITE",
    budgetEliteFeature: "การวิเคราะห์งบขั้นสูงและแนวโน้มหลายเดือน",
    budgetCreateFirst: "สร้างงบประมาณ",
    budgetAllGoals: "เป้าหมายทั้งหมด",

    // Goal Simulation Page
    goalSimulationTitle: "จำลองเป้าหมาย",
    goalSimulationSub: "วางแผนอนาคตทางการเงินด้วยการจำลอง AI",
    goalSimulationGoalsTab: "เป้าหมาย",
    goalSimulationSimulationTab: "จำลอง",
    goalSimulationUnlockElite: "ปลดล็อก Elite",
    goalSimulationTargetDate: "วันเป้าหมาย",
    goalSimulationRemaining: "คงเหลือ",
    goalSimulationSaved: "ออมแล้ว",
    goalSimulationTarget: "เป้า",
    goalSimulationMonths: "เดือน",
    goalSimulationAIRecommendation: "คำแนะนำ AI",
    goalSimulationScenario: "สถานการณ์จำลอง",
    goalSimulationModerateGrowth: "การเติบโตแบบปานกลาง",
    goalSimulationAggressiveSave: "ออมเข้มข้น",
    goalSimulationRelaxedPace: "ผ่อนคลาย",
    goalSimulationMonthlyContribution: "เงินออมรายเดือน",
    goalSimulationProjectedTimeline: "ไทม์ไลน์ที่คาดการณ์",
    goalSimulation24Months: "คาดการณ์ 24 เดือน",
    goalSimulationRun: "รัน",
    goalSimulationSimulating: "กำลังจำลอง...",
    goalSimulationProjectedValue: "มูลค่าคาดการณ์",
    goalSimulationTimeToGoal: "เวลาถึงเป้า",
    goalSimulationAIInsight: "ข้อมูลเชิงลึก AI",
    goalSimulationUnlockAdvanced: "ปลดล็อกการจำลองขั้นสูง",
    goalSimulationUnlockAdvancedDesc: "เข้าถึงการคาดการณ์ Money Twin, การติดตามหลายเป้าหมาย และการเปรียบเทียบสถานการณ์ AI",
    goalSimulationUpgradeElite: "อัปเกรดเป็น Elite",
    goalSimulationComplete: "สำเร็จ",
    goalSimulationNow: "ปัจจุบัน",
    goalSimulationReturn: "ผลตอบแทน",

    // Money Twin Blueprint Page
    moneyTwinTitle: "พิมพ์เขียว Money Twin",
    moneyTwinSub: "ตัวตนทางการเงินของคุณ — สถานะปัจจุบันเทียบเป้าหมาย",
    moneyTwinYourTwin: "ตัวตน Money Twin ของคุณ",
    moneyTwinLevel: "Money Twin ระดับ",
    moneyTwinStreak: "สตรีค",
    moneyTwinArchetype: "แบบแผนพฤติกรรม",
    moneyTwinTwinRadar: "เรดาร์ Twin",
    moneyTwinCurrentVsIdeal: "สถานะปัจจุบัน (เส้นทึบ) เทียบเป้าหมาย (เส้นประ) — เติมเต็มช่องว่าง",
    moneyTwinCurrent: "ปัจจุบัน",
    moneyTwinIdeal: "เป้าหมาย",
    moneyTwinPredictionEngine: "เครื่องคาดการณ์ Twin",
    moneyTwinPredictionSub: "การคาดการณ์การตัดสินใจทางการเงินถัดไปด้วย AI",
    moneyTwinRecommendations: "คำแนะนำปรับแนว Twin",
    moneyTwinEvolution: "วิวัฒนาการ Twin",
    moneyTwinEliteFeature: "ฟีเจอร์ ELITE",
    moneyTwinEliteDesc: "วิวัฒนาการ Twin รายสัปดาห์ต้องใช้แพลน ELITE",
    moneyTwinUnlockElite: "ปลดล็อก ELITE",
    moneyTwinAllGood: "Twin ของคุณสอดคล้องดีแล้ว! รักษาสิ่งที่ทำอยู่",
    moneyTwinBasicPreview: "ตัวอย่างพรีเมียม — แสดง 3 จาก 5 แกน",
    moneyTwinProActive: "PRO เปิดใช้งาน — เรดาร์ 5 แกนเต็มรูปแบบปลดล็อกแล้ว",
    moneyTwinProDesc: "อัปเกรดเป็น ELITE เพื่อปลดล็อกการคาดการณ์พฤติกรรมและไทม์ไลน์รายสัปดาห์",
  }
};
