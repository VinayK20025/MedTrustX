'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeptAlert } from '../types/hod.types';
import { Bell } from 'lucide-react';

interface Props { alerts: DeptAlert[]; }

const typeStyle: Record<string, string> = {
  critical: 'border-l-emergency bg-emergency/5',
  warning:  'border-l-warning bg-warning/5',
  info:     'border-l-indigo-500 bg-indigo-500/5',
};
const typeLabel: Record<string, string> = {
  critical: 'text-emergency-light',
  warning:  'text-warning-light',
  info:     'text-indigo-300',
};

export function AlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-warning-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Alerts</h3>
            <p className="text-xs text-gray-400 mt-0.5">{alerts.filter(a => a.actionRequired).length} action required</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2 overflow-y-auto max-h-[350px]">
        {alerts.map(a => (
          <div key={a.id} className={`p-3 border-l-2 rounded-r-lg ${typeStyle[a.type]}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${typeLabel[a.type]}`}>● {a.type}</span>
              {a.actionRequired && <span className="text-[9px] text-emergency-light bg-emergency/10 px-1.5 py-0.5 rounded animate-pulse">ACTION REQUIRED</span>}
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">{a.message}</p>
            {a.patientName && <p className="text-[10px] text-gray-500 mt-1">Patient: <span className="text-gray-300">{a.patientName}</span></p>}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
