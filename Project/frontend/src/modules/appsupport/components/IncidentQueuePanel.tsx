'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AppIncident, IncidentSeverity } from '../types/appsupport.types';
import { AlertTriangle, ServerCrash } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incidents: AppIncident[]; selectedId?: string; onSelect: (id: string) => void; }

const sevColor: Record<IncidentSeverity, string> = {
  'Sev 1': 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse',
  'Sev 2': 'bg-orange-500/20 text-orange-400',
  'Sev 3': 'bg-warning/20 text-warning-light',
  'Sev 4': 'bg-blue-500/20 text-blue-300',
};

export function IncidentQueuePanel({ incidents, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emergency/15"><AlertTriangle className="w-4 h-4 text-emergency-light" /></div>
          <h3 className="text-[14px] font-bold text-white tracking-wide">Incident Queue</h3>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{incidents.length} Active</span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {incidents.map(inc => (
            <div key={inc.id} onClick={() => onSelect(inc.id)}
              className={cn("p-4 cursor-pointer transition-all border-l-4 relative group",
                selectedId === inc.id ? "bg-white/[0.08] border-l-white/50" :
                inc.severity === 'Sev 1' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.05]" :
                "border-l-transparent hover:bg-white/[0.02]"
              )}>
              <div className="flex justify-between items-start mb-2">
                <div className="pr-2">
                  <span className="text-[9px] text-gray-500 font-mono block mb-0.5">{inc.id} • {inc.appAffected}</span>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-blue-300 transition-colors">{inc.title}</h4>
                </div>
                <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded tracking-wider', sevColor[inc.severity])}>{inc.severity}</span>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-[10px]">
                <span className={cn("px-2 py-0.5 rounded font-bold uppercase", inc.status === 'Resolved' ? "bg-success/10 text-success-light" : "bg-white/10 text-gray-300")}>{inc.status}</span>
                <span className="text-gray-500 font-mono flex items-center gap-1">
                  <ServerCrash className="w-3 h-3" /> {new Date(inc.firstSeenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
