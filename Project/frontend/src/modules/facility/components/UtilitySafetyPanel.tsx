'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { UtilityStatus } from '../types/facility.types';
import { Zap, ShieldCheck, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { utilities: UtilityStatus[]; }

const utilIcon: Record<string, React.ReactNode> = {
  Power: <Zap className="w-4 h-4" />,
  Water: <Droplets className="w-4 h-4" />,
  HVAC: <Thermometer className="w-4 h-4" />,
  'Medical Gas': <Activity className="w-4 h-4" />, // Fallback
};

const utilColor: Record<string, string> = {
  Normal: 'text-success-light',
  Warning: 'text-warning-light animate-pulse',
  Critical: 'text-emergency-light animate-pulse',
};

// Extracted from lucide missing import fix
function Activity(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }

export function UtilitySafetyPanel({ utilities }: Props) {
  const hasAlerts = utilities.some(u => u.status !== 'Normal');

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Utilities Real-Time Monitor */}
      <Card className={cn("shadow-glass flex-1 flex flex-col", hasAlerts ? "border-warning/30" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-blue-400">UTILITIES STATUS</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {utilities.map(u => (
              <div key={u.type} className={cn("p-4 flex items-center justify-between", u.status !== 'Normal' && "bg-warning/[0.03]")}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-white/5", utilColor[u.status])}>{utilIcon[u.type] || <Activity className="w-4 h-4" />}</div>
                  <div>
                    <h4 className="text-[12px] font-bold text-white">{u.type}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{new Date(u.lastCheck).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-[11px] font-bold font-mono flex items-center gap-1 justify-end", utilColor[u.status])}>
                    {u.status !== 'Normal' && <AlertTriangle className="w-3 h-3" />} {u.reading}
                  </span>
                  <p className="text-[9px] uppercase tracking-wider text-gray-600 mt-1">{u.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Fire & Safety Compliance */}
      <Card className="border-white/[0.06] shadow-glass flex-[0.6] flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-emerald-400">SAFETY SYSTEMS</h3>
        </CardHeader>
        <CardBody className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
             <span className="text-[11px] font-bold text-white">Fire Alarm Panels</span>
             <span className="text-[10px] bg-success/20 text-success-light px-2 py-0.5 rounded font-mono font-bold">ONLINE</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
             <span className="text-[11px] font-bold text-white">Sprinkler System</span>
             <span className="text-[10px] bg-success/20 text-success-light px-2 py-0.5 rounded font-mono font-bold">NORMAL PRESS</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-emergency/10 border border-emergency/20 rounded-xl">
             <span className="text-[11px] font-bold text-emergency-light flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Extinguisher Insp.</span>
             <span className="text-[10px] text-emergency-light font-mono font-bold">OVERDUE (3 Days)</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
