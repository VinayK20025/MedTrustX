/**
 * MedTrustX — Button Component
 * Enterprise-grade button with variants, sizes, loading state, and icons.
 */
'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:bg-teal-700',
  secondary:
    'bg-surface-light hover:bg-surface-elevated text-gray-200 border border-white/10 hover:border-white/20',
  ghost:
    'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  danger:
    'bg-emergency hover:bg-emergency-dark text-white shadow-lg shadow-emergency/20 hover:shadow-emergency/30',
  outline:
    'bg-transparent border border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500',
  success:
    'bg-success hover:bg-success-dark text-white shadow-lg shadow-success/20',
  link:
    'bg-transparent text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline p-0 h-auto',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs px-2.5 py-1 gap-1 rounded-md',
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-4 py-2 gap-2 rounded-lg',
  lg: 'text-base px-6 py-2.5 gap-2 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-surface-dark',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.97]',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
