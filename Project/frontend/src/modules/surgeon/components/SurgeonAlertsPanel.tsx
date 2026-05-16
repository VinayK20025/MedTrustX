'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SurgeonAlert } from '../types/surgeon.types';
import { Bell } from 'lucide-react';

interface Props { alerts: SurgeonAlert[]; }

const severityStyle: Record<string, string> = {
  critical: 'border-l-emergency bg-emergency/5 text-emergency-light',
  warning:  'border-l-warning bg-warning/5 text-warning-light',
  info:     'border-l-indigo-500 bg-indigo-500/5 text-indigo-300',
};

export function SurgeonAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-emergency-light" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Critical Alerts</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2 overflow-y-auto max-h-[300px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 border-l-2 rounded-r-lg ${severityStyle[a.severity]}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest">{a.type.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">{a.message}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
