/**
 * MedTrustX — Spinner / Skeleton / Loading Components
 */
'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

/* ── Spinner ───────────────────────────────────────────── */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-teal-400', spinnerSizes[size], className)}
      aria-label="Loading"
    />
  );
}

/* ── Full-page loading ─────────────────────────────────── */
export interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-surface-dark flex flex-col items-center justify-center gap-4 z-[9999]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-teal-500 animate-spin" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-r-teal-300/30 animate-spin-slow" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">{message}</p>
    </div>
  );
}

/* ── Skeleton ──────────────────────────────────────────── */
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const variantStyles = {
    text:   'h-4 rounded',
    rect:   'rounded-lg',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-white/[0.06] animate-shimmer',
        variantStyles[variant],
        className,
      )}
      style={{
        width: width ?? (variant === 'circle' ? height : '100%'),
        height: height ?? (variant === 'text' ? undefined : '100%'),
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        backgroundSize: '200% 100%',
      }}
      aria-hidden
    />
  );
}

/* ── Inline Loader ─────────────────────────────────────── */
export function InlineLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  );
}
