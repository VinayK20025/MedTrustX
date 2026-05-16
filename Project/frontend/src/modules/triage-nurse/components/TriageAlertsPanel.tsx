'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TriageAlert } from '../types/triage.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: TriageAlert[]; }

export function TriageAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-emergency/40 shadow-[0_0_20px_rgba(239,68,68,0.1)] bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-3 flex items-center gap-2 bg-emergency/10">
        <Siren className="w-4 h-4 text-emergency-light animate-pulse" />
        <h3 className="text-[15px] font-bold text-emergency-light tracking-wide">WAITING ALERTS</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[250px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 rounded-lg border flex flex-col gap-2 ${
            a.severity === 'critical' ? 'border-emergency/30 bg-emergency/10' : 'border-warning/30 bg-warning/10'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${a.severity === 'critical' ? 'text-emergency-light' : 'text-warning-light'}`}>
               {a.type.replace(/_/g, ' ')}
            </span>
            <p className="text-[13px] font-semibold text-white leading-tight">{a.message}</p>
            <div className="flex justify-between items-center mt-1">
               <span className="text-[10px] font-mono text-gray-400">{new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
               <Button size="sm" variant="outline" className={`h-6 px-3 text-[10px] border-white/10 ${a.severity === 'critical' ? 'hover:bg-emergency/20 text-emergency-light' : 'hover:bg-warning/20 text-warning-light'}`}>Acknowledge</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
