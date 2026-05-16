'use client';
import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const variantColors = {
  default: 'bg-teal-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-emergency',
};

const sizeStyles = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export function ProgressBar({ value, max = 100, variant = 'default', size = 'md', showLabel, label, className }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const autoVariant = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : variant;

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-gray-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-white/[0.06] rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantColors[autoVariant])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
