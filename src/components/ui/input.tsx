'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-bold text-text-primary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 min-h-[48px] rounded-[var(--radius-md)]',
            'bg-surface border-2 text-text-primary text-base',
            'placeholder:text-text-muted',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-error focus:ring-red-300'
              : 'border-border-default focus:border-earth-green-500 focus:ring-earth-green-200',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-error font-bold" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input, type InputProps };
