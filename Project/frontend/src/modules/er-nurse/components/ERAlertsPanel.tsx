'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ERAlert } from '../types/er.types';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: ERAlert[]; }

export function ERAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-emergency/40 shadow-[0_0_20px_rgba(239,68,68,0.1)] bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-3 flex items-center gap-2 bg-emergency/10">
        <Siren className="w-4 h-4 text-emergency-light animate-pulse" />
        <h3 className="text-[15px] font-bold text-emergency-light tracking-wide">ER ALERTS</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[250px]">
        {alerts.map(a => (
          <div key={a.id} className="p-3 rounded-lg border border-emergency/30 bg-emergency/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emergency-light">
                 {a.type.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-gray-400">{new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p className="text-[13px] font-semibold text-white leading-tight">{a.message}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-gray-400">{a.location}</span>
              <Button size="sm" className="h-6 px-3 text-[10px] font-bold bg-emergency hover:bg-emergency-light text-white border-none">Acknowledge</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
