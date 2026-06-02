import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface StepTrackerProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  stepDescriptions?: string[];
  completedSteps?: number[];
}

export const CancellationStepTracker: React.FC<StepTrackerProps> = ({
  currentStep,
  totalSteps,
  stepLabels = Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`),
  stepDescriptions = [],
  completedSteps = [],
}) => {
  // Calculate progress
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Default descriptions if not provided
  const descriptions = stepDescriptions.length > 0 
    ? stepDescriptions 
    : [
        'Review your account',
        'Confirm cancellation reason',
        'Final review',
        'Cancellation complete',
      ];

  return (
    <div className="w-full space-y-4">
      {/* Visual progress bar with milestone indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Cancellation Progress</h3>
          <span className="text-xs font-bold text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {/* Progress bar background with step markers */}
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          {/* Filled progress */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Step markers */}
          <div className="relative h-full flex items-center">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const isCompleted = completedSteps.includes(index) || index < currentStep;
              const isActive = index === currentStep;

              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${((index + 1) / totalSteps) * 100}%` }}
                >
                  {/* Step circle badge */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                      isCompleted
                        ? 'bg-primary border-primary text-black shadow-lg'
                        : isActive
                          ? 'bg-white border-primary text-primary shadow-[0_4px_12px_rgba(199,255,46,0.3)]'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step details - show current and next step */}
      <div className="space-y-3">
        {/* Current step detail */}
        {currentStep < totalSteps && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-25 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-white">{currentStep + 1}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  {stepLabels[currentStep]}
                </h4>
                <p className="text-xs text-gray-600">
                  {descriptions[currentStep]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next step preview */}
        {currentStep < totalSteps - 1 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-500">{currentStep + 2}</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-600 uppercase tracking-wide mb-1">
                  Next:
                </h4>
                <p className="text-xs text-gray-600">
                  {stepLabels[currentStep + 1]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion state */}
        {currentStep >= totalSteps && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  Cancellation Completed
                </h4>
                <p className="text-xs text-gray-600">
                  Your subscription has been successfully cancelled.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline view - show all steps */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">All Steps</h4>
        <div className="space-y-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = completedSteps.includes(index) || index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/15 border border-primary/30'
                    : isCompleted
                      ? 'bg-gray-100'
                      : 'bg-gray-50'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" strokeWidth={2.5} />
                ) : isActive ? (
                  <AlertCircle size={16} className="text-blue-600 shrink-0 animate-pulse" strokeWidth={2.5} />
                ) : (
                  <Circle size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
                )}
                <span
                  className={`text-xs font-semibold ${
                    isActive
                      ? 'text-gray-900'
                      : isCompleted
                        ? 'text-gray-600 line-through'
                        : 'text-gray-500'
                  }`}
                >
                  {stepLabels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
