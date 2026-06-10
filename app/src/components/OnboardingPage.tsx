import { useState } from 'react';
import { DollarSign, BrainCircuit, Activity, Sparkles, ChevronRight, Check, Shield, Target, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, Language } from '../data/translations';
import { supabase } from '../supabaseClient';

interface OnboardingPageProps {
  onComplete: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onCurrencySelect?: (currency: string) => void;
}

export type SupportedCurrency = 'THB' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD';

const CURRENCIES: { code: SupportedCurrency; icon: string; flag: string }[] = [
  { code: 'THB', icon: '฿', flag: '🇹🇭' },
  { code: 'USD', icon: '$', flag: '🇺🇸' },
  { code: 'EUR', icon: '€', flag: '🇪🇺' },
  { code: 'GBP', icon: '£', flag: '🇬🇧' },
  { code: 'JPY', icon: '¥', flag: '🇯🇵' },
  { code: 'SGD', icon: 'S$', flag: '🇸🇬' },
];

export default function OnboardingPage({ onComplete, lang, setLang, onCurrencySelect }: OnboardingPageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isCommitted, setIsCommitted] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency | null>(null);

  const t = translations[lang];
  const steps = t.onboardingSteps;

  const saveOnboardingPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const updates: Record<string, unknown> = {};
    if (selectedCurrency) updates.base_currency = selectedCurrency;
    if (selectedChallenge !== null) updates.challenge = selectedChallenge;

    if (Object.keys(updates).length > 0) {
      await supabase.from('users').update(updates).eq('id', session.user.id);
    }
  };

  return (
    <div id="onboarding-viewport" className="min-h-screen flex flex-col justify-between p-6 md:p-10 relative overflow-hidden bg-[#0C0D0E] text-white">
      
      {/* Background neon dynamic meshes */}
      <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-[#C7FF2E]/10 blur-[100px] pointer-events-none transition-opacity opacity-100" />
      <div className="absolute bottom-20 -left-10 w-[240px] h-[240px] rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none" />

      {/* 1. Header logo block */}
      <div className="flex items-center justify-between z-10" id="onboarding-top">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border bg-[#1A1B1E] border-[#2B2D31]" id="brand-tag">
          <div className="w-2.5 h-2.5 bg-[#C7FF2E] rounded-full animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-zinc-400">DAILYSTACK FINTECH OS</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* pre-login switches */}
          <button
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            className="px-2.5 py-1 rounded-lg border font-mono font-bold text-[9px] tracking-wider uppercase cursor-pointer bg-[#131416]/90 border-zinc-800 text-[#C7FF2E]"
          >
            {lang === 'en' ? 'EN' : 'TH'}
          </button>

          <button 
            id="btn-skip-onboarding"
            onClick={onComplete}
            className="font-mono text-[10px] uppercase tracking-widest transition-colors cursor-pointer text-zinc-500 hover:text-white"
          >
            {t.introductionSkip}
          </button>
        </div>
      </div>

      {/* 2. Slide Carousel wrapper */}
      <div className="max-w-2xl mx-auto w-full my-auto py-12 z-10" id="onboarding-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            id={`slide-${activeStep}`}
            className="space-y-8"
          >
            {/* Step 2: Core Financial Challenge */}
            {activeStep === 1 ? (
              <div className="p-8 rounded-[32px] border relative overflow-hidden transition-all duration-300 bg-[#131416] border-[#222428]" id="challenge-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7FF2E]/5 rounded-bl-[120px]" />

                <div className="flex items-center justify-between mb-8" id="carousel-bulletins">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    {t.moduleLabel} {activeStep + 1} / {steps.length + 1}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase bg-[#C7FF2E]/10 text-[#C7FF2E]">
                    <Target className="w-3 h-3" /> CORE CHALLENGE
                  </span>
                </div>

                <div className="text-center mb-6">
                  <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-white">
                    {t.financialChallenge.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="challenge-options">
                  {t.financialChallenge.options.map((opt, i) => (
                    <button
                      key={i}
                      id={`btn-challenge-${i}`}
                      onClick={() => setSelectedChallenge(i)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        selectedChallenge === i
                          ? 'bg-[#C7FF2E]/10 border-[#C7FF2E] text-[#C7FF2E]'
                          : 'bg-[#1A1B1E] border-[#2B2D31] text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className={`font-display font-extrabold text-sm mb-0.5 ${selectedChallenge === i ? 'text-[#C7FF2E]' : 'text-white'}`}>
                            {opt.title}
                          </div>
                          <div className="text-xs text-zinc-500 leading-snug">
                            {opt.subtitle}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                          selectedChallenge === i ? 'bg-[#C7FF2E] border-[#C7FF2E]' : 'border-zinc-600'
                        }`}>
                          {selectedChallenge === i && <Check className="w-3 h-3 text-black" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeStep === 2 ? (
              /* Step 3: Base Currency Selection */
              <div className="p-8 rounded-[32px] border relative overflow-hidden transition-all duration-300 bg-[#131416] border-[#222428]" id="currency-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7FF2E]/5 rounded-bl-[120px]" />

                <div className="flex items-center justify-between mb-8" id="carousel-bulletins">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    {t.moduleLabel} {activeStep + 1} / {steps.length + 1}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase bg-[#C7FF2E]/10 text-[#C7FF2E]">
                    <Globe className="w-3 h-3" /> BASE CURRENCY
                  </span>
                </div>

                <div className="text-center mb-6">
                  <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-white">
                    {t.baseCurrencyTitle}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-2">
                    {t.baseCurrencySub}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="currency-options">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      id={`btn-currency-${curr.code}`}
                      onClick={() => setSelectedCurrency(curr.code)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        selectedCurrency === curr.code
                          ? 'bg-[#C7FF2E]/10 border-[#C7FF2E] text-[#C7FF2E]'
                          : 'bg-[#1A1B1E] border-[#2B2D31] text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-mono font-bold">{curr.icon}</span>
                        <div>
                          <div className={`font-display font-extrabold text-xs ${selectedCurrency === curr.code ? 'text-[#C7FF2E]' : 'text-white'}`}>
                            {curr.code}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {String(t[`baseCurrency${curr.code}` as keyof typeof t] || curr.code)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeStep === 4 ? (
              /* Step 5: Commitment Declaration */
              <div className="p-8 rounded-[32px] border relative overflow-hidden transition-all duration-300 bg-[#131416] border-[#222428]" id="commitment-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7FF2E]/5 rounded-bl-[120px]" />

                <div className="flex items-center justify-between mb-8" id="carousel-bulletins">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    {t.moduleLabel} {activeStep + 1} / {steps.length + 1}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase bg-[#C7FF2E]/10 text-[#C7FF2E]">
                    <Shield className="w-3 h-3" /> {t.commitmentTitle}
                  </span>
                </div>

                <div className="space-y-6" id="commitment-content">
                  <div className="text-center space-y-2">
                    <h2 className="font-display font-medium text-xs uppercase tracking-widest text-[#ECEEF2]">
                      {t.commitmentSubtitle}
                    </h2>
                    <div className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-[#C7FF2E]">
                      {steps[3].statsVal}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border bg-[#1A1B1E] border-[#2B2D31]" id="commitment-statement">
                    <p className="text-sm md:text-base leading-relaxed text-zinc-300 italic">
                      "{t.commitmentStatement}"
                    </p>
                  </div>

                  <button
                    id="btn-commit-toggle"
                    onClick={() => setIsCommitted(!isCommitted)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
                      isCommitted
                        ? 'bg-[#C7FF2E]/10 border-[#C7FF2E] text-[#C7FF2E]'
                        : 'bg-[#1A1B1E] border-[#2B2D31] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isCommitted ? 'bg-[#C7FF2E] border-[#C7FF2E]' : 'border-zinc-600'
                    }`}>
                      {isCommitted && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest">
                      {t.commitmentConfirm}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Steps 0, 3, 5: Visual showcase + narrative */
              <>
                <div className="p-8 rounded-[32px] border relative overflow-hidden transition-all duration-300 bg-[#131416] border-[#222428]" id="visual-showcase">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7FF2E]/5 rounded-bl-[120px]" />

                  <div className="flex items-center justify-between mb-8" id="carousel-bulletins">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                      {t.moduleLabel} {activeStep + 1} / {steps.length + 1}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase bg-[#C7FF2E]/10 text-[#C7FF2E]">
                      <Sparkles className="w-3 h-3" /> {t.luxurySystem}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center" id="carousel-grid">
                    <div>
                      <h2 className="font-display font-medium text-xs uppercase tracking-widest text-[#ECEEF2]">
                        {t.immediateImpact}
                      </h2>
                      <div className="font-display text-4xl md:text-5xl font-extrabold mt-2 mb-1 tracking-tight text-[#C7FF2E]">
                        {steps[activeStep === 5 ? 4 : activeStep]?.statsVal || '$0'}
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">
                        {steps[activeStep === 5 ? 4 : activeStep]?.statsLabel || ''}
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl border bg-[#1A1B1E] border-[#2B2D31]" id="feature-benchmarks">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="w-3.5 h-3.5 text-[#C7FF2E]" />
                        <span className="text-zinc-300">Calculated Money Engine</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <BrainCircuit className="w-3.5 h-3.5 text-[#C7FF2E]" />
                        <span className="text-zinc-300">Behavior-Regulating Radar</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Activity className="w-3.5 h-3.5 text-[#C7FF2E]" />
                        <span className="text-zinc-300">Automated Wealth Narrative</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Narrative text block */}
                <div className="space-y-4" id="carousel-narrative">
                  <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight leading-tight text-white">
                    {steps[activeStep === 5 ? 4 : activeStep]?.title || t.brand}
                  </h1>
                  <p className="text-sm md:text-base leading-relaxed font-sans max-w-xl text-zinc-400">
                    {steps[activeStep === 5 ? 4 : activeStep]?.desc || ''}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Controls indicators and Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full max-w-5xl mx-auto z-10" id="onboarding-footer">
        
        {/* Navigation Dot indicators */}
        <div className="flex gap-2" id="positional-dots">
          {[...Array(steps.length + 1)].map((_, i) => (
            <button
               id={`btn-dot-${i}`}
               key={i}
               onClick={() => setActiveStep(i)}
               className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeStep === i ? 'w-8 bg-[#C7FF2E]' : 'w-2 bg-zinc-800'}`}
             />
          ))}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-4 w-full sm:w-auto" id="nav-actions">
          {activeStep > 0 && (
            <button
               id="btn-prev-step"
               onClick={() => setActiveStep(prev => prev - 1)}
               className="px-6 py-3.5 rounded-2xl font-mono text-[11px] uppercase tracking-widest transition-colors cursor-pointer text-zinc-400 hover:text-white"
            >
              {lang === 'en' ? 'Back' : 'กลับ'}
            </button>
          )}

          {/* Step 5 Commitment Controls */}
          {activeStep === 4 ? (
            <>
              <button
                id="btn-decline-commitment"
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-6 py-3.5 rounded-2xl font-mono text-[11px] uppercase tracking-widest transition-colors cursor-pointer text-zinc-500 hover:text-zinc-300"
              >
                {t.commitmentDecline}
              </button>
              <button
                id="btn-confirm-commitment"
                onClick={async () => {
                  await saveOnboardingPreferences();
                  if (selectedCurrency && onCurrencySelect) {
                    onCurrencySelect(selectedCurrency);
                  }
                  onComplete();
                }}
                disabled={!isCommitted}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer font-display font-extrabold text-xs uppercase tracking-wider ${
                  isCommitted 
                    ? 'bg-[#C7FF2E] hover:bg-white text-black hover:scale-[1.01]' 
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span>{t.commitmentConfirm}</span>
                {isCommitted && <ChevronRight className="w-4 h-4 font-bold" />}
              </button>
            </>
          ) : (
            <button
              id="btn-next-step"
              onClick={async () => {
                if (activeStep < steps.length) {
                  setActiveStep(prev => prev + 1);
                } else {
                  await saveOnboardingPreferences();
                  if (selectedCurrency && onCurrencySelect) {
                    onCurrencySelect(selectedCurrency);
                  }
                  onComplete();
                }
              }}
              disabled={(activeStep === 1 && selectedChallenge === null) || (activeStep === 2 && selectedCurrency === null)}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-display font-extrabold text-xs uppercase tracking-wider ${
                (activeStep === 1 && selectedChallenge === null) || (activeStep === 2 && selectedCurrency === null)
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'text-black hover:scale-[1.01] cursor-pointer bg-[#C7FF2E] hover:bg-white'
              }`}
            >
              <span>{activeStep === steps.length ? t.launchOS : t.nextStep}</span>
              <ChevronRight className="w-4 h-4 font-bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
