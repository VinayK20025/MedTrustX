'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TriageRouteOption } from '../types/triage.types';
import { MapPin } from 'lucide-react';

interface Props { options: TriageRouteOption[]; }

export function TriageRoutingPanel({ options }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-white tracking-wide">Destination Routing</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 space-y-2 overflow-y-auto">
        {options.map(o => (
          <div key={o.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-white/[0.04]">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-white block">{o.name}</span>
                <span className="text-[10px] text-gray-500 font-mono">{o.capacity}</span>
              </div>
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
              o.status === 'available' ? 'bg-success/20 text-success-light' :
              o.status === 'busy' ? 'bg-warning/20 text-warning-light' :
              'bg-emergency/20 text-emergency-light'
            }`}>
              {o.status}
            </span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
