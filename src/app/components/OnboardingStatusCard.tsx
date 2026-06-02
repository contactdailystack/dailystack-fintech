import React from 'react';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingStatusCardProps {
  completionPercentage: number;
  interestCount?: number;
  budgetCount?: number;
  isComplete?: boolean;
  onEditClick?: () => void;
}

export const OnboardingStatusCard: React.FC<OnboardingStatusCardProps> = ({
  completionPercentage,
  interestCount = 0,
  budgetCount = 0,
  isComplete = false,
  onEditClick,
}) => {
  if (isComplete) {
    return (
      <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-5 border-2 border-primary/30 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 size={20} className="text-black" strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-black text-sm text-black">Profile Setup Complete</h4>
              <p className="text-xs text-gray-600 mt-1">
                {interestCount} interests selected • {budgetCount} budgets set
              </p>
            </div>
          </div>
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="text-xs font-bold text-black hover:text-primary transition-colors px-3 py-1 hover:bg-black/5 rounded-lg"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-25 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            <h4 className="font-bold text-sm text-gray-900">Complete Your Profile</h4>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            {completionPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-500 shadow-sm"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* CTA */}
        <button
          onClick={onEditClick}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2.5 rounded-lg transition-colors active:scale-[0.98]"
        >
          Continue Setup <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
