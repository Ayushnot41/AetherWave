'use client';

import { cn } from '@/lib/utils';
import { Check, X, Loader2 } from 'lucide-react';

type StepStatus = 'pending' | 'processing' | 'success' | 'failed';

interface Step {
  id: string;
  label: string;
  status: StepStatus;
  failureReason?: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  className?: string;
}

const statusIcons: Record<StepStatus, React.ReactNode> = {
  pending: (
    <div className="w-8 h-8 rounded-full border-2 border-sand-300 bg-sand-50" aria-hidden="true" />
  ),
  processing: (
    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center" aria-hidden="true">
      <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
    </div>
  ),
  success: (
    <div className="w-8 h-8 rounded-full bg-earth-green-500 flex items-center justify-center" aria-hidden="true">
      <Check className="h-4 w-4 text-white" />
    </div>
  ),
  failed: (
    <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center" aria-hidden="true">
      <X className="h-4 w-4 text-white" />
    </div>
  ),
};

const statusLabels: Record<StepStatus, string> = {
  pending: 'Waiting',
  processing: 'In progress',
  success: 'Complete',
  failed: 'Failed',
};

export function ProgressTracker({ steps, className }: ProgressTrackerProps) {
  return (
    <div className={cn('flex flex-col gap-0', className)} role="list" aria-label="Verification progress">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-3" role="listitem">
            {/* Vertical line + icon */}
            <div className="flex flex-col items-center">
              {statusIcons[step.status]}
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[32px]',
                    step.status === 'success' ? 'bg-earth-green-500' : 'bg-sand-300',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Label + status */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className="text-base font-bold text-text-primary">{step.label}</p>
              <p
                className={cn(
                  'text-sm',
                  step.status === 'failed' ? 'text-error font-bold' : 'text-text-muted',
                )}
              >
                {step.status === 'failed' && step.failureReason
                  ? step.failureReason
                  : statusLabels[step.status]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { type Step, type StepStatus };
