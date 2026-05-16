/**
 * MedTrustX — Select Component
 */
'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, fullWidth = true, className, id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-300">
            {label}
            {props.required && <span className="text-emergency-light ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'w-full appearance-none px-4 py-2.5 pr-10 bg-white/5 border rounded-lg text-white text-sm',
              'focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-emergency/50' : 'border-white/10 hover:border-white/20',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-surface-dark">
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {error && (
          <p className="text-xs text-emergency-light" role="alert">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
