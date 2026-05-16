'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeputyAlert } from '../types/deputy.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: DeputyAlert[]; }

export function DeputyAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-emergency/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 bg-emergency/5">
        <Siren className="w-5 h-5 text-emergency-light" />
        <h3 className="text-lg font-semibold text-emergency-light tracking-wide">Active Alerts</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 rounded-lg border ${a.priority === 'high' ? 'border-emergency/30 bg-emergency/10' : 'border-warning/30 bg-warning/10'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${a.priority === 'high' ? 'text-emergency-light' : 'text-warning-light'}`}>{a.ward}</span>
            </div>
            <p className="text-xs text-white leading-relaxed mb-2">{a.message}</p>
            <div className="flex justify-end">
              <Button size="sm" className={`h-6 px-3 text-[10px] text-white border-none ${a.priority === 'high' ? 'bg-emergency hover:bg-emergency-light' : 'bg-warning hover:bg-warning-light text-black'}`}>Escalate</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
