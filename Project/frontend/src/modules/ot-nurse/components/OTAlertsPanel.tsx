'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTAlert } from '../types/ot.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: OTAlert[]; }

export function OTAlertsPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center gap-2">
          <Siren className="w-4 h-4 text-gray-500" />
          <h3 className="text-[15px] font-semibold text-gray-300 tracking-wide">Safety Alerts</h3>
        </CardHeader>
        <CardBody className="p-4 flex-1 flex items-center justify-center">
          <p className="text-sm font-mono text-success-light bg-success/10 px-4 py-2 rounded-lg border border-success/20">
            ALL SYSTEMS NOMINAL
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-emergency/40 shadow-[0_0_20px_rgba(239,68,68,0.1)] bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-3 flex items-center gap-2 bg-emergency/10">
        <Siren className="w-4 h-4 text-emergency-light animate-pulse" />
        <h3 className="text-[15px] font-bold text-emergency-light tracking-wide">OT ALERTS</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[250px]">
        {alerts.map(a => (
          <div key={a.id} className="p-3 rounded-lg border border-emergency/30 bg-emergency/10 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emergency-light">
               {a.type.replace('_', ' ')}
            </span>
            <p className="text-[13px] font-semibold text-white leading-tight">{a.message}</p>
            <div className="flex justify-end mt-1">
              <Button size="sm" className="h-6 px-3 text-[10px] font-bold bg-emergency hover:bg-emergency-light text-white border-none">Acknowledge</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
