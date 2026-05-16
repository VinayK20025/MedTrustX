'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowRight, HeartPulse } from 'lucide-react';
import type { ClinicalKPI } from '../types/med-director.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface Props { kpi: ClinicalKPI; className?: string; }

const cfg = {
  normal:    { color: 'text-success-light', bg: 'bg-success/10', border: 'border-success/20' },
  improving: { color: 'text-teal-300', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  warning:   { color: 'text-warning-light', bg: 'bg-warning/10', border: 'border-warning/20' },
  critical:  { color: 'text-emergency-light', bg: 'bg-emergency/10', border: 'border-emergency/20' },
};

export function ClinicalKPICard({ kpi, className }: Props) {
  const router = useRouter();
  const c = cfg[kpi.status];

  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass flex flex-col justify-between', c.bg, c.border, className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{kpi.title}</p>
        <HeartPulse className={cn('w-4 h-4', c.color)} />
      </div>
      <div className="mt-2 mb-1">
        <div className="flex items-baseline gap-1">
          <p className={cn('text-2xl font-black tracking-tight', c.color)}>{kpi.value}</p>
          {kpi.unit && <span className="text-xs text-gray-500">{kpi.unit}</span>}
        </div>
        {kpi.benchmark && <p className="text-[10px] text-gray-500 mt-0.5">{kpi.benchmark}</p>}
        {kpi.delta && <p className={cn('text-[10px] mt-1 font-semibold', kpi.delta.startsWith('-') ? 'text-success-light' : kpi.delta.startsWith('+') ? 'text-warning-light' : 'text-gray-400')}>{kpi.delta}</p>}
      </div>
      {kpi.actionLabel && (
        <div className="mt-auto border-t border-white/[0.06] pt-3">
          <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08]"
            onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}>
            {kpi.actionLabel}
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Button>
        </div>
      )}
    </div>
  );
}
