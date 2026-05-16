'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ERAlert } from '../types/er.types';
import { Siren } from 'lucide-react';
import { useAcknowledgeERAlert } from '../hooks/useERAnalytics';

interface Props { alerts: ERAlert[]; }

export function ERAlertsPanel({ alerts }: Props) {
  const { mutate: ack, isPending } = useAcknowledgeERAlert();

  return (
    <Card className="border-emergency/30 shadow-glass bg-emergency/5 h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-4 flex items-center gap-2">
        <Siren className="w-5 h-5 text-emergency-light animate-pulse" />
        <h3 className="text-lg font-semibold text-emergency-light tracking-wide">ER ALERTS</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2 overflow-y-auto max-h-[250px]">
        {alerts.map(a => (
          <div key={a.id} className="p-3 bg-surface-dark border border-emergency/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${a.severity === 'critical' ? 'text-emergency-light animate-pulse' : 'text-warning-light'}`}>
                ● {a.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed mb-2">{a.message}</p>
            <Button size="sm" onClick={() => ack(a.id)} disabled={isPending} className="w-full h-6 text-[10px] bg-emergency/20 hover:bg-emergency/40 text-white border-none">
              Acknowledge
            </Button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
