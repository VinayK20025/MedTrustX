'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CnoKPI } from '../types/cno.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface CnoKPICardProps {
  kpi: CnoKPI;
  className?: string;
}

const statusConfig = {
  good: { color: 'text-success-light', bg: 'bg-success/10', border: 'border-success/20', icon: CheckCircle2 },
  warning: { color: 'text-warning-light', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertCircle },
  critical: { color: 'text-emergency-light', bg: 'bg-emergency/10', border: 'border-emergency/20', icon: AlertCircle },
  neutral: { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', icon: null }
};

export function CnoKPICard({ kpi, className }: CnoKPICardProps) {
  const router = useRouter();
  const config = statusConfig[kpi.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass flex flex-col justify-between',
        config.bg, config.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">{kpi.title}</p>
        {Icon && <Icon className={cn('w-4 h-4', config.color)} />}
      </div>
      
      <div className="mt-2 mb-3">
        <p className={cn('text-3xl font-black tracking-tight', config.color)}>
          {kpi.value}
        </p>
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
