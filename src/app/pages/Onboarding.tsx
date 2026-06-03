import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getProfile, saveOnboardingProfile } from '../services/authService';
import { addUserSubscription } from '../services/subscriptionService';
import { trackEvent } from '../../utils/analytics';

interface SubscriptionTemplate {
  id: string;
  name: string;
  category: string;
  defaultAmount: number;
  logoColor: string;
}

interface SubscriptionDraft {
  id: string;
  name: string;
  category: string;
  amount: number;
  nextBillingDate: string;
  logoColor: string;
}

const STEPS = [
  { id: 'profile', label: 'Profile' },
  { id: 'pick', label: 'Pick subscriptions' },
  { id: 'details', label: 'Billing details' },
  { id: 'review', label: 'Cost review' },
];

const SUBSCRIPTION_TEMPLATES: SubscriptionTemplate[] = [
  { id: 'netflix', name: 'Netflix Premium', category: 'Entertainment', defaultAmount: 419, logoColor: 'bg-black' },
  { id: 'spotify', name: 'Spotify Premium', category: 'Entertainment', defaultAmount: 139, logoColor: 'bg-[#1DB954]' },
  { id: 'youtube', name: 'YouTube Premium', category: 'Entertainment', defaultAmount: 159, logoColor: 'bg-[#FF0000]' },
  { id: 'icloud', name: 'iCloud+', category: 'Cloud Storage', defaultAmount: 99, logoColor: 'bg-[#007AFF]' },
  { id: 'chatgpt', name: 'ChatGPT Plus', category: 'Productivity', defaultAmount: 720, logoColor: 'bg-[#10A37F]' },
  { id: 'adobe', name: 'Adobe Creative Cloud', category: 'Creative Tools', defaultAmount: 1390, logoColor: 'bg-[#ED2224]' },
  { id: 'disney', name: 'Disney+', category: 'Entertainment', defaultAmount: 289, logoColor: 'bg-[#113CCF]' },
  { id: 'notion', name: 'Notion Plus', category: 'Productivity', defaultAmount: 360, logoColor: 'bg-[#111111]' },
];

const formatMoney = (amount: number) => `${Math.round(amount).toLocaleString()} THB`;

const getDefaultBillingDate = (index: number) => {
  const date = new Date();
  date.setDate(date.getDate() + 7 + index * 3);
  return date.toISOString().slice(0, 10);
};

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="mb-8 animate-fade-in">
    {/* Step dots row */}
    <div className="flex items-center gap-0">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`step-dot ${
                index < currentStep
                  ? 'step-dot--completed'
                  : index === currentStep
                  ? 'step-dot--active'
                  : 'step-dot--pending'
              }`}
            >
              {index < currentStep ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:block ${
                index <= currentStep ? 'text-[#CCFF00]' : 'text-white/30'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className="step-connector flex-1 mx-1.5 mt-[-20px]">
              <div
                className="step-connector-fill"
                style={{ width: index < currentStep ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const TemplateCard: React.FC<{
  template: SubscriptionTemplate;
  selected: boolean;
  onToggle: () => void;
}> = ({ template, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    data-testid={`onboarding-subscription-${template.id}`}
    className={`template-card relative min-h-[118px] rounded-2xl border p-4 text-left ${
      selected
        ? 'border-primary bg-primary text-black shadow-[0_10px_34px_rgba(204,255,0,0.28)]'
        : 'border-white/10 bg-[#1A1A1A] text-white shadow-sm'
    }`}
  >
    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${template.logoColor} text-white shadow-sm`}>
      <span className="text-sm font-black">{template.name.charAt(0)}</span>
    </div>
    <p className="text-sm font-black leading-tight">{template.name}</p>
    <p className={`mt-1 text-xs font-semibold ${selected ? 'text-white/70' : 'text-white/40'}`}>
      {template.category}
    </p>
    <p className="mt-3 text-xs font-black">{formatMoney(template.defaultAmount)} / month</p>
    {selected && (
      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black text-primary" style={{ animation: 'checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <Check size={14} strokeWidth={3} />
      </span>
    )}
  </button>
);

const CostSummary: React.FC<{ drafts: SubscriptionDraft[] }> = ({ drafts }) => {
  const monthly = drafts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const yearly = monthly * 12;
  const nearest = drafts
    .filter((item) => item.nextBillingDate)
    .sort((a, b) => +new Date(a.nextBillingDate) - +new Date(b.nextBillingDate))[0];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl bg-black p-4 text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Monthly recurring</p>
        <p className="mt-2 text-2xl font-black">{formatMoney(monthly)}</p>
      </div>
      <div className="rounded-2xl bg-[#1A1A1A] p-4 text-white shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Annual exposure</p>
        <p className="mt-2 text-2xl font-black">{formatMoney(yearly)}</p>
      </div>
      <div className="rounded-2xl bg-[#1A1A1A] p-4 text-white shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Next renewal</p>
        <p className="mt-2 text-base font-black">{nearest ? nearest.name : 'Add one first'}</p>
        <p className="mt-1 text-xs font-semibold text-white/40">{nearest?.nextBillingDate || 'No billing date yet'}</p>
      </div>
    </div>
  );
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [drafts, setDrafts] = useState<SubscriptionDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyOnboarding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const profile = await getProfile(user.id);
        if (profile?.onboarding_completed_at) {
          navigate('/dashboard');
          return;
        }

        setNickname(user.user_metadata?.nickname || user.user_metadata?.full_name?.split(' ')[0] || '');
      } catch (err) {
        console.error('Onboarding redirect check failed:', err);
      }
    };

    verifyOnboarding();
  }, [navigate]);

  const totalMonthly = useMemo(
    () => drafts.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [drafts],
  );

  const toggleTemplate = (template: SubscriptionTemplate) => {
    setDrafts((prev) => {
      if (prev.some((item) => item.id === template.id)) {
        return prev.filter((item) => item.id !== template.id);
      }

      return [
        ...prev,
        {
          id: template.id,
          name: template.name,
          category: template.category,
          amount: template.defaultAmount,
          nextBillingDate: getDefaultBillingDate(prev.length),
          logoColor: template.logoColor,
        },
      ];
    });
  };

  const updateDraft = (id: string, updates: Partial<SubscriptionDraft>) => {
    setDrafts((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const canProceed = () => {
    if (currentStep === 0) return nickname.trim().length > 0;
    if (currentStep === 2) {
      return drafts.every((item) => item.name.trim() && Number(item.amount) > 0 && item.nextBillingDate);
    }
    return true;
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    setError('');

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user session found.');

      for (const draft of drafts) {
        await addUserSubscription({
          name: draft.name.trim(),
          amount: Number(draft.amount),
          next_billing_date: draft.nextBillingDate,
          category: draft.category,
        });
      }

      await saveOnboardingProfile(
        user.id,
        nickname.trim(),
        [],
        {
          onboarding_goal: 'subscription_cost_awareness',
          subscriptions_seeded: drafts.length,
          monthly_recurring_cost: totalMonthly,
          annual_recurring_cost: totalMonthly * 12,
        },
      );

      void trackEvent('onboarding_completed', {
        subscriptions_seeded: drafts.length,
        monthly_recurring_cost: totalMonthly,
        annual_recurring_cost: totalMonthly * 12,
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Error during subscription onboarding:', err);
      setError('Unable to save your setup. Please try again before continuing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0D0D0D] text-white font-sans overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0D0D0D] px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 animate-fade-in">
            <Sparkles size={18} className="text-[#5B7A00]" />
            <span className="text-sm font-black tracking-[0.18em]">DAILYSTACK</span>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black text-white/50 tracking-widest uppercase animate-fade-in delay-150">
            Setup {currentStep + 1}/{STEPS.length}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-[120px] pt-6 md:px-8 md:pt-8">
        <ProgressIndicator currentStep={currentStep} />

        {currentStep === 0 && (
          <section className="space-y-6">
            <div className="text-center animate-fade-up">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-black shadow-[0_8px_36px_rgba(204,255,0,0.32)] animate-float">
                <Wallet size={36} />
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl animate-fade-up delay-75">
                Start with the money that leaves every month.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base font-semibold text-white/50 animate-fade-up delay-150">
                DailyStack works best when it can map your recurring subscriptions first.
                Add a few now and you will see your monthly and yearly exposure instantly.
              </p>
            </div>

            <div className="rounded-3xl bg-[#1A1A1A] p-6 shadow-lg animate-fade-up delay-225">
              <label className="mb-3 block text-sm font-black text-white/80">
                What should we call you?
              </label>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Your nickname"
                maxLength={30}
                autoComplete="nickname"
                className="input-field min-h-[54px] w-full rounded-2xl border-2 border-white/10 bg-[#1A1A1A] px-5 text-base font-bold text-white outline-none"
              />
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-white/40">
                <span>This name appears on your cost review.</span>
                <span className={`font-black ${nickname.length >= 25 ? 'text-orange-500' : ''}`}>{nickname.length}/30</span>
              </div>
            </div>
          </section>
        )}

        {currentStep === 1 && (
          <section className="space-y-6">
            <div className="text-center animate-fade-up">
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">Choose what you pay for now</h1>
                <p className="mx-auto mt-3 max-w-xl text-base font-semibold text-white/40">
                Pick the subscriptions you already use. You can edit prices and billing dates on the next step.
              </p>
              {drafts.length > 0 && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-black text-black animate-fade-in">
                  <Check size={11} strokeWidth={3} /> {drafts.length} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {SUBSCRIPTION_TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={drafts.some((item) => item.id === template.id)}
                  onToggle={() => toggleTemplate(template)}
                />
              ))}
            </div>

            {drafts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#1A1A1A]/50 p-5 text-center">
                <p className="text-sm font-bold text-white/50">
                  You can skip for now, but adding one subscription unlocks the cost insight immediately.
                </p>
              </div>
            )}
          </section>
        )}

        {currentStep === 2 && (
          <section className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">Confirm price and renewal date</h1>
                <p className="mx-auto mt-3 max-w-xl text-base font-semibold text-white/40">
                Accurate billing dates make DailyStack useful before money leaves your account.
              </p>
            </div>

            {drafts.length > 0 ? (
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <div key={draft.id} className="rounded-3xl bg-[#1A1A1A] p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${draft.logoColor} text-white`}>
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{draft.name}</p>
                        <p className="text-xs font-semibold text-white/40">{draft.category}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Name</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Amount / month</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Next billing</span>
                        <input
                          type="date"
                          value={draft.nextBillingDate}
                          onChange={(event) => updateDraft(draft.id, { nextBillingDate: event.target.value })}
                          className="min-h-[48px] w-full rounded-xl border border-black/5 bg-gray-50 px-3 text-sm font-bold outline-none focus:border-primary"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-[#1A1A1A] p-8 text-center shadow-sm">
                <p className="text-lg font-black text-white">No subscriptions selected yet.</p>
                <p className="mt-2 text-sm font-semibold text-white/40">
                  Go back and pick one, or continue to start with an empty dashboard.
                </p>
              </div>
            )}
          </section>
        )}

        {currentStep === 3 && (
          <section className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {drafts.length ? 'Your recurring cost is now visible.' : 'Your dashboard is ready.'}
              </h1>
                <p className="mx-auto mt-3 max-w-xl text-base font-semibold text-white/40">
                {drafts.length
                  ? 'This is the number DailyStack will help you monitor, review, and reduce.'
                  : 'Add your first subscription from the dashboard to unlock recurring cost insights.'}
              </p>
            </div>

            <CostSummary drafts={drafts} />

            {drafts.length > 0 && (
              <div className="rounded-3xl bg-[#1A1A1A] p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/40">Selected stack</p>
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3">
                      <div>
                        <p className="text-sm font-black text-white">{draft.name}</p>
                        <p className="text-xs font-semibold text-white/40">Next billing: {draft.nextBillingDate}</p>
                      </div>
                      <p className="text-sm font-black">{formatMoney(draft.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm font-bold text-red-400">
                {error}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-black/5 glass px-4 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white/10 px-6 text-base font-black text-white/70 transition active:scale-[0.98]"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || loading}
            data-testid="onboarding-continue-button"
            className="btn-primary flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-black text-black shadow-[0_8px_32px_rgba(204,255,0,0.32)] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            {loading ? (
              <><span className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" /> Saving...</>
            ) : currentStep === STEPS.length - 1 ? (
              <>
                Open dashboard <Sparkles size={18} />
              </>
            ) : currentStep === 1 && drafts.length === 0 ? (
              <>
                Skip for now <ChevronRight size={18} />
              </>
            ) : (
              <>
                Continue <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
