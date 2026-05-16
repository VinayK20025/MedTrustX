/**
 * MedTrustX — Card Component
 * Glassmorphism card with header, body, footer slots.
 */
'use client';

import React from 'react';
import { cn } from '@/utils/cn';

/* ── Card Root ─────────────────────────────────────────── */
export interface CardProps {
  variant?: 'glass' | 'solid' | 'outlined';
  hover?: boolean;
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({
  variant = 'glass',
  hover = false,
  padding = false,
  className,
  children,
  onClick,
}: CardProps) {
  const baseStyles = {
    glass:    'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-glass',
    solid:    'bg-surface-light border border-white/[0.06]',
    outlined: 'bg-transparent border border-white/10',
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        baseStyles[variant],
        hover && 'transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.16] hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        padding && 'p-6',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

/* ── Card Header ───────────────────────────────────────── */
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-5 border-b border-white/[0.06]', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Card Body ─────────────────────────────────────────── */
export interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function CardBody({ className, children }: CardBodyProps) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

/* ── Card Footer ───────────────────────────────────────── */
export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('px-5 py-3 border-t border-white/[0.06] flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
}
