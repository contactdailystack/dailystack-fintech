import { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { SubscriptionTier } from '../services/userTierService';

interface PaywallGateProps {
  requiredTier: 'pro' | 'elite';
  currentTier: SubscriptionTier;
  onNavigateToUpgrade: () => void;
  children: ReactNode;
  fallbackUI?: 'blur' | 'lock' | 'banner';
}

const TIER_ORDER: Record<SubscriptionTier, number> = {
  basic: 0,
  pro: 1,
  elite: 2,
};

export function PaywallGate({ requiredTier, currentTier, onNavigateToUpgrade, children, fallbackUI = 'lock' }: PaywallGateProps) {
  const tierLabels = { pro: 'PRO', elite: 'ELITE' };
  const tierColors = { pro: 'text-[#C7FF2E]', elite: 'text-[#FFD700]' };
  const isUnlocked = TIER_ORDER[currentTier] >= TIER_ORDER[requiredTier];

  if (isUnlocked) return <>{children}</>;

  if (fallbackUI === 'blur') {
    return (
      <div className="relative">
        <div className="filter blur-sm opacity-40 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-[#171C15] border border-[#C7FF2E]/20 rounded-2xl p-6 text-center max-w-sm">
            <Lock className={`w-8 h-8 mx-auto mb-3 ${tierColors[requiredTier]}`} />
            <p className="text-white font-black text-sm mb-1">Upgrade to {tierLabels[requiredTier]}</p>
            <p className="text-white/50 text-xs">Unlock this feature with a {tierLabels[requiredTier]} subscription</p>
          </div>
        </div>
      </div>
    );
  }

  if (fallbackUI === 'banner') {
    return (
      <div>
        {children}
        <div className="mt-3 bg-gradient-to-r from-[#171C15] to-[#1A1A1A] border border-[#C7FF2E]/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Sparkles className={`w-5 h-5 shrink-0 ${tierColors[requiredTier]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-xs">Unlock with {tierLabels[requiredTier]}</p>
              <p className="text-white/50 text-[10px] mt-0.5">This feature requires a {tierLabels[requiredTier]} subscription</p>
            </div>
            <button
              onClick={onNavigateToUpgrade}
              className="bg-[#C7FF2E] text-[#0B0F0A] px-3 py-1.5 rounded-full text-[10px] font-black shrink-0 cursor-pointer hover:bg-white transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F0A]/60 backdrop-blur-sm rounded-xl">
        <div className="bg-[#171C15] border border-[#C7FF2E]/20 rounded-2xl p-5 text-center">
          <Lock className={`w-6 h-6 mx-auto mb-2 ${tierColors[requiredTier]}`} />
          <p className="text-white font-black text-xs">{tierLabels[requiredTier]} Only</p>
          <p className="text-white/40 text-[10px] mt-1">Upgrade to unlock</p>
        </div>
      </div>
    </div>
  );
}