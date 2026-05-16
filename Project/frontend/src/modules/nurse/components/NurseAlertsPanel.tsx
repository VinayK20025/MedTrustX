'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NurseAlert } from '../types/nurse.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: NurseAlert[]; }

export function NurseAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-emergency/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 bg-emergency/5">
        <Siren className="w-5 h-5 text-emergency-light" />
        <h3 className="text-lg font-semibold text-emergency-light tracking-wide">Critical Alerts</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 rounded-lg border ${a.priority === 'high' ? 'border-emergency/30 bg-emergency/10' : 'border-warning/30 bg-warning/10'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${a.priority === 'high' ? 'text-emergency-light' : 'text-warning-light'}`}>
                 {a.patientName} ({a.bed})
              </span>
            </div>
            <p className="text-xs text-white leading-relaxed mb-3">{a.message}</p>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] border-white/20 text-white hover:bg-white/10">Escalate</Button>
              <Button size="sm" className="h-6 px-3 text-[10px] bg-emergency hover:bg-emergency-light text-white border-none">Acknowledge</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
