'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({ label, description, checked, onChange, disabled, className }: ToggleSwitchProps) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 py-3 cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-surface-dark',
          checked ? 'bg-teal-500' : 'bg-white/[0.12]',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
            'mt-0.5',
          )}
        />
      </button>
    </label>
  );
}
