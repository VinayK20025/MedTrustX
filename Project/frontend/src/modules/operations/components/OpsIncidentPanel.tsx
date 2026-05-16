'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { OpsIncident } from '../types/operations.types';
import { useResolveIncident } from '../hooks/useOperationsAnalytics';
import { AlertTriangle, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incidents: OpsIncident[]; }

const sevColor: Record<string, string> = {
  Critical: 'bg-emergency/20 text-emergency-light border border-emergency/30',
  High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  Medium: 'bg-amber-500/20 text-amber-300',
  Low: 'bg-blue-500/20 text-blue-300',
};

export function OpsIncidentPanel({ incidents }: Props) {
  const { mutate: resolve, isPending } = useResolveIncident();
  const activeCount = incidents.filter(i => i.status !== 'Resolved').length;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-orange-400">ACTIVE INCIDENTS</h3>
        </div>
        {activeCount > 0 && <span className="text-[9px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold uppercase animate-pulse">{activeCount} Alert(s)</span>}
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {incidents.map(inc => (
            <div key={inc.id} className={cn("p-4", inc.severity === 'Critical' && inc.status !== 'Resolved' && "bg-emergency/[0.03]")}>
              <div className="flex justify-between items-start mb-2">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", sevColor[inc.severity])}>{inc.severity}</span>
                <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(inc.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <h4 className="text-[12px] font-bold text-white mb-1">{inc.type}</h4>
              <p className="text-[11px] text-gray-300 mb-2">{inc.description}</p>
              
              <div className="flex items-center justify-between mt-3 text-[10px] font-mono">
                <div className="flex flex-col gap-1">
                   <span className="text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-500" /> {inc.location}</span>
                   {inc.assignedTo && <span className="text-blue-300">Assignee: {inc.assignedTo}</span>}
                </div>
                {inc.status !== 'Resolved' ? (
                  <Button size="sm" disabled={isPending} onClick={() => resolve(inc.id)} className="h-7 text-[10px] bg-white/5 hover:bg-success/20 hover:text-success-light text-gray-300 border border-white/10" leftIcon={<CheckCircle2 className="w-3 h-3" />}>Resolve</Button>
                ) : (
                  <span className="text-success-light font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
