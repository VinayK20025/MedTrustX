'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICUOTStatus } from '../types/superintendent.types';
import { HeartPulse, Scissors } from 'lucide-react';

interface Props { units: ICUOTStatus[]; }

const statusStyle: Record<string, { badge: string }> = {
  available:  { badge: 'bg-success/20 text-success-light' },
  high_load:  { badge: 'bg-warning/20 text-warning-light' },
  full:       { badge: 'bg-emergency/20 text-emergency-light' },
};

export function ICUOTPanel({ units }: Props) {
  const icuUnits = units.filter(u => u.type === 'icu');
  const otUnits = units.filter(u => u.type === 'ot');

  const renderUnit = (u: ICUOTStatus) => {
    const st = statusStyle[u.status];
    const pct = Math.round((u.inUse / u.totalCapacity) * 100);
    return (
      <div key={u.unit} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">{u.unit}</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${st.badge}`}>{u.status.replace('_', ' ')}</span>
        </div>
        <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full ${pct >= 90 ? 'bg-emergency' : pct >= 70 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div><span className="text-gray-500 block">In Use</span><span className="text-gray-300">{u.inUse}/{u.totalCapacity}</span></div>
          <div><span className="text-gray-500 block">Queue</span><span className={u.waitingQueue > 0 ? 'text-warning-light font-bold' : 'text-gray-300'}>{u.waitingQueue}</span></div>
          <div><span className="text-gray-500 block">Alerts</span><span className={u.criticalAlerts > 0 ? 'text-emergency-light font-bold' : 'text-gray-300'}>{u.criticalAlerts}</span></div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <HeartPulse className="w-5 h-5 text-emergency-light" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">ICU & OT Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">Capacity, queue & critical alerts</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[420px]">
        {icuUnits.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> ICU Units</p>
            <div className="space-y-2">{icuUnits.map(renderUnit)}</div>
          </div>
        )}
        {otUnits.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Scissors className="w-3 h-3" /> Operating Theatres</p>
            <div className="space-y-2">{otUnits.map(renderUnit)}</div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
