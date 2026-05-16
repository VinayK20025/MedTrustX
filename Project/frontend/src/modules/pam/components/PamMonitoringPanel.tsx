'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PAMLiveActivity } from '../types/pam.types';
import { Terminal, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activities: PAMLiveActivity[]; }

export function PamMonitoringPanel({ activities }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-dark h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-surface-light">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Terminal className="w-4 h-4 text-teal-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide font-sans">Live Monitoring Stream</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-sans">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Live
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[400px] text-[11px] space-y-1.5">
        {activities.map(act => (
          <div key={act.id} className={cn(
            "p-2 rounded flex gap-3",
            act.riskLevel === 'critical' ? 'bg-emergency/10 text-emergency-light' : 
            act.riskLevel === 'warning' ? 'bg-warning/10 text-warning-light' : 'text-gray-400 hover:bg-white/[0.02]'
          )}>
            <span className="opacity-50 flex-shrink-0">[{new Date(act.timestamp).toLocaleTimeString()}]</span>
            <span className="font-bold text-gray-300 flex-shrink-0">{act.user}@{act.sessionId}:</span>
            <span className="flex-1 break-all">{act.command}</span>
            {act.riskLevel === 'critical' && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
