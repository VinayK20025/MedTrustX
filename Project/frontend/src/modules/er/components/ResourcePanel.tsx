'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ERResourceStatus } from '../types/er.types';
import { Database } from 'lucide-react';

interface Props { resources: ERResourceStatus[]; }

const statusStyle: Record<string, string> = {
  critical: 'text-emergency-light',
  warning: 'text-warning-light',
  normal: 'text-success-light',
};

export function ResourcePanel({ resources }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Resources (ICU/OT)</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3">
        {resources.map(r => {
          const pct = Math.round((r.available / r.total) * 100);
          return (
            <div key={r.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">{r.label}</span>
                <span className={`font-mono font-bold ${statusStyle[r.status]}`}>{r.available} / {r.total}</span>
              </div>
              <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${r.status === 'critical' ? 'bg-emergency animate-pulse' : r.status === 'warning' ? 'bg-warning' : 'bg-success'}`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
