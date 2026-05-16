'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AdverseEvent } from '../types/research-nurse.types';
import { useReportAdverseEvent } from '../hooks/useResearchNurseAnalytics';
import { ShieldAlert, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { events: AdverseEvent[]; }

const severityColor: Record<string, string> = {
  Mild: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Moderate: 'bg-warning/15 text-warning-light border-warning/30',
  Severe: 'bg-emergency/15 text-emergency-light border-emergency/30',
  'Life-Threatening': 'bg-red-600/15 text-red-400 border-red-600/30'
};

export function AdverseEventsPanel({ events }: Props) {
  const { mutate: reportAE } = useReportAdverseEvent();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400" /> Safety & AE Log
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        <div className="p-4 space-y-3 flex-1">
          {events.length === 0 ? (
            <div className="text-center py-10 opacity-40">
              <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-[11px] text-gray-500 font-bold">No adverse events reported</p>
            </div>
          ) : (
            events.map(e => (
              <div key={e.id} className={cn('border rounded-xl p-4', severityColor[e.severity])}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-gray-400">{e.subject}</span>
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1', severityColor[e.severity])}>
                    <AlertTriangle className="w-2.5 h-2.5" /> {e.severity}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-white mb-2">{e.description}</p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-500">{new Date(e.reportedAt).toLocaleString()}</span>
                  <span className={cn('font-bold uppercase tracking-wider',
                    e.status === 'Reported' ? 'text-orange-400' : e.status === 'Resolved' ? 'text-success-light' : 'text-blue-400'
                  )}>{e.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40">
          <Button onClick={() => reportAE({ type: 'new' })} className="w-full h-10 bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 text-[12px]" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Report New Adverse Event
          </Button>
          <p className="text-[9px] text-gray-600 text-center mt-2">Immediately escalates to PI and safety monitoring board.</p>
        </div>
      </CardBody>
    </Card>
  );
}
