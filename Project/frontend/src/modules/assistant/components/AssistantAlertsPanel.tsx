'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AssistantAlert } from '../types/assistant.types';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { alerts: AssistantAlert[]; }

export function AssistantAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-warning/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-warning/20 px-5 py-3 flex items-center gap-2 bg-warning/10">
        <BellRing className="w-4 h-4 text-warning-light animate-pulse" />
        <h3 className="text-[15px] font-bold text-warning-light tracking-wide">NURSE CALLS</h3>
      </CardHeader>
      <CardBody className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[250px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 rounded-lg border flex flex-col gap-2 border-warning/30 bg-warning/10`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest text-warning-light`}>
               {a.type.replace(/_/g, ' ')}
            </span>
            <p className="text-[13px] font-semibold text-white leading-tight">{a.message}</p>
            <div className="flex justify-between items-center mt-1">
               <span className="text-[10px] font-mono text-gray-400">{new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
               <Button size="sm" className="h-6 px-3 text-[10px] bg-warning text-black hover:bg-warning-light font-bold">Respond</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
