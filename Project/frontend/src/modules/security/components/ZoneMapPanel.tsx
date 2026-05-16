'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SecurityZone, ZoneStatus } from '../types/security.types';
import { useLockZone } from '../hooks/useSecurityAnalytics';
import { MapPin, Lock, ShieldAlert, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { zones: SecurityZone[]; }

const statusConfig: Record<ZoneStatus, { color: string; dot: string; label: string }> = {
  Secure: { color: 'border-l-emerald-500 hover:bg-emerald-500/[0.03]', dot: 'bg-emerald-400', label: 'bg-emerald-500/20 text-emerald-400' },
  Alert: { color: 'border-l-emergency bg-emergency/[0.03] hover:bg-emergency/[0.06]', dot: 'bg-emergency-light animate-pulse', label: 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse' },
  Crowd: { color: 'border-l-warning hover:bg-warning/[0.03]', dot: 'bg-warning-light animate-pulse', label: 'bg-warning/20 text-warning-light' },
  Lockdown: { color: 'border-l-red-700 bg-red-900/10', dot: 'bg-red-400 animate-pulse', label: 'bg-red-900/30 text-red-300 border border-red-700/40' },
};

export function ZoneMapPanel({ zones }: Props) {
  const { mutate: lockZone } = useLockZone();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
        <div className="p-1.5 rounded bg-red-500/15"><MapPin className="w-4 h-4 text-red-400" /></div>
        <h3 className="text-[14px] font-bold text-white tracking-wide">Facility Zone Status</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {zones.map(zone => {
            const cfg = statusConfig[zone.status];
            return (
              <div key={zone.id} className={cn("p-4 border-l-4 transition-colors cursor-pointer group", cfg.color)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                    <h4 className="text-[14px] font-bold text-white group-hover:text-red-300 transition-colors">{zone.name}</h4>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', cfg.label)}>{zone.status}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> {zone.guardCount} guard{zone.guardCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-600 font-mono text-[9px]">{new Date(zone.lastScanAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {zone.status === 'Alert' && (
                  <button onClick={() => lockZone(zone.id)}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-[10px] font-bold text-red-300 bg-red-900/20 border border-red-700/40 hover:bg-red-900/40 px-3 py-2 rounded transition-colors">
                    <Lock className="w-3 h-3" /> Initiate Zone Lockdown
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
