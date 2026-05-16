'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { JRAlert } from '../types/jr.types';
import { AlertTriangle } from 'lucide-react';

interface Props { alerts: JRAlert[]; }

export function JRAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-warning/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 bg-warning/5">
        <AlertTriangle className="w-5 h-5 text-warning-light" />
        <h3 className="text-lg font-semibold text-warning-light tracking-wide">Supervisor Alerts</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {alerts.map(a => (
          <div key={a.id} className="p-3 rounded-lg border border-warning/30 bg-warning/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-warning-light tracking-widest">Note</span>
            </div>
            <p className="text-xs text-white leading-relaxed">{a.message}</p>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">No new alerts</div>
        )}
      </CardBody>
    </Card>
  );
}
