'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICUAlert } from '../types/icu.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: ICUAlert[]; }

export function ICUAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-emergency/40 shadow-[0_0_30px_rgba(239,68,68,0.1)] bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-4 flex items-center gap-2 bg-emergency/10">
        <Siren className="w-5 h-5 text-emergency-light animate-pulse" />
        <h3 className="text-lg font-bold text-emergency-light tracking-wide">CRITICAL ALERTS</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 rounded-lg border ${a.severity === 'critical' ? 'border-emergency bg-emergency/20' : 'border-emergency/40 bg-emergency/5'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${a.severity === 'critical' ? 'text-white' : 'text-emergency-light'}`}>
                 {a.bed} - {a.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed mb-3">{a.message}</p>
            <div className="flex gap-2 justify-end">
              <Button size="sm" className="h-7 px-4 text-xs font-bold bg-emergency hover:bg-emergency-light text-white border-none">Acknowledge</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
