/**
 * MedTrustX — Badge Component
 */
'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'clinical' | 'emergency' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:   'bg-white/10 text-gray-300',
  success:   'bg-success/15 text-success-light',
  danger:    'bg-emergency/15 text-emergency-light',
  warning:   'bg-warning/15 text-warning-light',
  info:      'bg-blue-500/15 text-blue-300',
  clinical:  'bg-clinical/15 text-clinical-light',
  emergency: 'bg-emergency/15 text-emergency-light',
  outline:   'bg-transparent border border-white/20 text-gray-300',
};

const dotColors: Record<BadgeVariant, string> = {
  default:   'bg-gray-400',
  success:   'bg-success-light',
  danger:    'bg-emergency-light',
  warning:   'bg-warning-light',
  info:      'bg-blue-400',
  clinical:  'bg-clinical-light',
  emergency: 'bg-emergency-light',
  outline:   'bg-gray-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-2xs px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[variant],
            pulse && 'animate-pulse',
          )}
        />
      )}
      {children}
    </span>
  );
}
