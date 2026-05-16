'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { FacilityAsset, AssetStatus } from '../types/facility.types';
import { Server, Search, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { assets: FacilityAsset[]; selectedId?: string; onSelect: (id: string) => void; }

const statusColor: Record<AssetStatus, string> = {
  Operational: 'bg-success/20 text-success-light',
  Maintenance: 'bg-amber-500/20 text-amber-300',
  Faulty: 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse',
  Offline: 'bg-gray-500/20 text-gray-400',
};

export function FacilityAssetPanel({ assets, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/15"><Server className="w-3.5 h-3.5 text-emerald-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Infrastructure Assets</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search assets or locations..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-emerald-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {assets.map(a => {
            return (
              <div key={a.id} onClick={() => onSelect(a.id)}
                className={cn("p-4 cursor-pointer transition-all border-l-2 relative",
                  selectedId === a.id ? "bg-emerald-500/[0.06] border-l-emerald-500" :
                  a.status === 'Faulty' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.04]" :
                  "border-l-transparent hover:bg-white/[0.015]"
                )}>
                <div className="flex justify-between items-start mb-1 pr-2">
                  <div>
                    <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                      {a.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{a.type} • {a.location}</p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap flex items-center gap-1', statusColor[a.status])}>
                     {a.status === 'Operational' && <Activity className="w-2.5 h-2.5" />}
                     {a.status}
                  </span>
                </div>
                {a.faultDetected && (
                  <div className="mt-2 text-[9px] text-emergency-light font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> System fault detected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
