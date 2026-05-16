'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowRight, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import type { CisoKPI } from '../types/ciso.types';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface CisoKPICardProps {
  kpi: CisoKPI;
  className?: string;
}

const statusConfig = {
  secure:   { color: 'text-success-light', bg: 'bg-success/10', border: 'border-success/20', icon: ShieldCheck, glow: '' },
  warning:  { color: 'text-warning-light', bg: 'bg-warning/10', border: 'border-warning/20', icon: ShieldAlert, glow: '' },
  critical: { color: 'text-emergency-light', bg: 'bg-emergency/10', border: 'border-emergency/20', icon: ShieldX, glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' },
  neutral:  { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', icon: ShieldCheck, glow: '' },
};

export function CisoKPICard({ kpi, className }: CisoKPICardProps) {
  const router = useRouter();
  const config = statusConfig[kpi.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass flex flex-col justify-between',
        config.bg, config.border, config.glow,
        kpi.status === 'critical' && 'animate-pulse-slow',
        className
      )}
    >
      {/* Scanline effect for critical */}
      {kpi.status === 'critical' && (
        <div className="absolute inset-0 bg-gradient-to-b from-emergency/[0.03] via-transparent to-emergency/[0.03] pointer-events-none" />
      )}

      <div className="flex items-start justify-between relative z-10">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">{kpi.title}</p>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>
      
      <div className="mt-2 mb-1 relative z-10">
        <p className={cn('text-3xl font-black tracking-tight font-mono', config.color)}>
          {kpi.value}
        </p>
        {kpi.delta && (
          <p className="text-[10px] text-gray-500 mt-1 font-mono">{kpi.delta}</p>
        )}
      </div>

      {kpi.actionLabel && (
        <div className="mt-auto border-t border-white/[0.06] pt-3 relative z-10">
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
