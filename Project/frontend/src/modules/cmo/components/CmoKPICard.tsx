'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { CmoKPI } from '../types/cmo.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface CmoKPICardProps {
  kpi: CmoKPI;
  className?: string;
}

const severityStyles = {
  good: 'text-success-light bg-success/10 border-success/20',
  warning: 'text-warning-light bg-warning/10 border-warning/20',
  critical: 'text-emergency-light bg-emergency/10 border-emergency/20',
  neutral: 'text-gray-400 bg-white/5 border-white/10'
};

export function CmoKPICard({ kpi, className }: CmoKPICardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface-light p-5 transition-all duration-300 shadow-glass flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{kpi.title}</p>
        <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border', severityStyles[kpi.severity])}>
          {kpi.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : kpi.trend.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {kpi.trend}
        </div>
      </div>
      
      <div className="mt-4 mb-5">
        <p className="text-4xl font-bold text-white tracking-tight font-mono">
          {kpi.value}
        </p>
      </div>

      {kpi.actionLabel && (
        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10"
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
