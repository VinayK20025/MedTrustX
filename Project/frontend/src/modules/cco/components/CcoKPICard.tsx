'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowRight, ShieldCheck, ShieldAlert, ShieldX, Shield } from 'lucide-react';
import type { CcoKPI } from '../types/cco.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface CcoKPICardProps {
  kpi: CcoKPI;
  className?: string;
}

const statusConfig = {
  compliant:     { color: 'text-success-light', bg: 'bg-success/10', border: 'border-success/20', icon: ShieldCheck },
  warning:       { color: 'text-warning-light', bg: 'bg-warning/10', border: 'border-warning/20', icon: ShieldAlert },
  non_compliant: { color: 'text-emergency-light', bg: 'bg-emergency/10', border: 'border-emergency/20', icon: ShieldX },
  neutral:       { color: 'text-gray-300', bg: 'bg-white/5', border: 'border-white/10', icon: Shield },
};

export function CcoKPICard({ kpi, className }: CcoKPICardProps) {
  const router = useRouter();
  const config = statusConfig[kpi.status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass flex flex-col justify-between',
      config.bg, config.border, className
    )}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{kpi.title}</p>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>
      
      <div className="mt-2 mb-1">
        <p className={cn('text-2xl font-black tracking-tight', config.color)}>{kpi.value}</p>
        {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
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
