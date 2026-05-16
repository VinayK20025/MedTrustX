'use client';
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Calendar } from 'lucide-react';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, hint, fullWidth = true, className, id, ...props }, ref) => {
    const inputId = id || `datepicker-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
            {label}
            {props.required && <span className="text-emergency-light ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            ref={ref}
            id={inputId}
            type="date"
            aria-invalid={!!error}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm',
              'focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500',
              'transition-all duration-200 [color-scheme:dark]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-emergency/50' : 'border-white/10 hover:border-white/20',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-emergency-light" role="alert">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
