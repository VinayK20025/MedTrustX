'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPI } from '../types/board.types';

interface KPICardProps {
  kpi: KPI;
  priority?: 'standard' | 'strategic';
  className?: string;
  onClick?: () => void;
}

const statusColors = {
  good: 'text-success-light',
  warning: 'text-warning-light',
  critical: 'text-emergency-light',
  neutral: 'text-gray-400'
};

const formatValue = (val: string | number, format: KPI['format']) => {
  if (typeof val === 'string') return val;
  switch (format) {
    case 'currency': return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    case 'percentage': return `${val.toFixed(1)}%`;
    case 'number': return new Intl.NumberFormat('en-IN').format(val);
    case 'ratio': return String(val);
  }
};

export function KPICard({ kpi, priority = 'standard', className, onClick }: KPICardProps) {
  const isStrategic = priority === 'strategic';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-surface-light p-5 transition-all duration-300',
        onClick && 'cursor-pointer hover:border-white/[0.16] hover:bg-white/[0.04]',
        isStrategic ? 'border-white/[0.12] shadow-glass-large' : 'border-white/[0.06] shadow-glass',
        className
      )}
    >
      {/* Decorative gradient for strategic KPIs */}
      {isStrategic && (
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{kpi.title}</p>
        
        <div className="mt-3 flex items-end justify-between">
          <p className={cn('font-bold text-white', isStrategic ? 'text-4xl' : 'text-3xl')}>
            {formatValue(kpi.value, kpi.format)}
          </p>
          
          <div className={cn('flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full bg-white/[0.04]', statusColors[kpi.status])}>
            {kpi.trendDirection === 'up' && <TrendingUp className="w-4 h-4" />}
            {kpi.trendDirection === 'down' && <TrendingDown className="w-4 h-4" />}
            {kpi.trendDirection === 'neutral' && <Minus className="w-4 h-4" />}
            {Math.abs(kpi.trend)}%
          </div>
        </div>
      </div>
    </div>
  );
}
