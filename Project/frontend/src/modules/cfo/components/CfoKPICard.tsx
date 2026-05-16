'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CfoKPI } from '../types/cfo.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface CfoKPICardProps {
  kpi: CfoKPI;
  className?: string;
}

const statusConfig = {
  positive: { color: 'text-success-light', bg: 'bg-success/10', border: 'border-success/20' },
  warning:  { color: 'text-warning-light', bg: 'bg-warning/10', border: 'border-warning/20' },
  negative: { color: 'text-emergency-light', bg: 'bg-emergency/10', border: 'border-emergency/20' },
  neutral:  { color: 'text-gray-300', bg: 'bg-white/5', border: 'border-white/10' },
};

export function CfoKPICard({ kpi, className }: CfoKPICardProps) {
  const router = useRouter();
  const config = statusConfig[kpi.status];

  const TrendIcon = kpi.trendDirection === 'up' ? TrendingUp : kpi.trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.status === 'positive' ? 'text-success-light' : kpi.status === 'negative' ? 'text-emergency-light' : kpi.status === 'warning' ? 'text-warning-light' : 'text-gray-400';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass flex flex-col justify-between',
        config.bg, config.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{kpi.title}</p>
      </div>
      
      <div className="mt-2 mb-1">
        <p className={cn('text-2xl font-black tracking-tight', config.color)}>
          {kpi.value}
        </p>
        {kpi.trend && (
          <div className={cn('flex items-center gap-1 mt-1.5', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs font-semibold">{kpi.trend}</span>
          </div>
        )}
      </div>

      {kpi.actionLabel && (
        <div className="mt-auto border-t border-white/[0.06] pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08]"
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
