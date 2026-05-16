'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NursingAlert } from '../types/nursing.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: NursingAlert[]; }

export function NursingAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-emergency/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 bg-emergency/5">
        <Siren className="w-5 h-5 text-emergency-light animate-pulse" />
        <h3 className="text-lg font-semibold text-emergency-light tracking-wide">Workforce Alerts</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {alerts.map(a => (
          <div key={a.id} className="p-3 rounded-lg border border-emergency/30 bg-emergency/10 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-emergency-light tracking-widest">{a.location}</span>
              <span className="text-[9px] text-gray-400 font-mono">Just now</span>
            </div>
            <p className="text-xs text-white leading-relaxed">{a.message}</p>
            <div className="flex justify-end mt-1">
              <Button size="sm" className="h-6 px-3 text-[10px] bg-emergency hover:bg-emergency-light text-white border-none">Resolve</Button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">No active alerts</div>
        )}
      </CardBody>
    </Card>
  );
}
