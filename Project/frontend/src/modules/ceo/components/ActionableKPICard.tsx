'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { CeoKPI } from '../types/ceo.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ActionableKPICardProps {
  kpi: CeoKPI;
  className?: string;
}

const statusColors = {
  good: 'text-success-light bg-success/10 border-success/20',
  warning: 'text-warning-light bg-warning/10 border-warning/20',
  critical: 'text-emergency-light bg-emergency/10 border-emergency/20',
  neutral: 'text-gray-400 bg-white/5 border-white/10'
};

const formatValue = (val: string | number, format: CeoKPI['format']) => {
  if (typeof val === 'string') return val;
  switch (format) {
    case 'currency': return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(val);
    case 'percentage': return `${val.toFixed(1)}%`;
    case 'number': return new Intl.NumberFormat('en-IN').format(val);
    case 'ratio': return String(val);
  }
};

export function ActionableKPICard({ kpi, className }: ActionableKPICardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass flex flex-col justify-between',
        statusColors[kpi.status].replace('text-', 'hover:border-').split(' ')[2], // Extract border color for hover
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{kpi.title}</p>
        <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border', statusColors[kpi.status])}>
          {kpi.trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
          {kpi.trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
          {kpi.trendDirection === 'neutral' && <Minus className="w-3 h-3" />}
          {Math.abs(kpi.trend)}%
        </div>
      </div>
      
      <div className="mt-2 mb-4">
        <p className="text-3xl font-bold text-white tracking-tight">
          {formatValue(kpi.value, kpi.format)}
        </p>
      </div>

      {kpi.actionLabel && (
        <div className="mt-auto border-t border-white/[0.06] pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-xs hover:bg-white/[0.04]"
            onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}
          >
            {kpi.actionLabel}
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Button>
        </div>
      )}
    </div>
  );
}
