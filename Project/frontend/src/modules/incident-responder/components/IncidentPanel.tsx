'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ShieldAlert, Crosshair, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Incident, IncidentPhase } from '../types/incident-responder.types';

interface IncidentPanelProps {
  incidents: Incident[];
  activeIncidentId?: string;
  onSelectIncident: (id: string) => void;
}

const severityColors: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
};

const phaseOrder: IncidentPhase[] = ['Detection', 'Analysis', 'Containment', 'Eradication', 'Recovery', 'Post-Incident'];
const phaseColors: Record<string, string> = {
  Detection: 'bg-amber-500', Analysis: 'bg-orange-500', Containment: 'bg-red-500',
  Eradication: 'bg-purple-500', Recovery: 'bg-indigo-500', 'Post-Incident': 'bg-emerald-500',
};

export const IncidentPanel: React.FC<IncidentPanelProps> = ({ incidents, activeIncidentId, onSelectIncident }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Active Breaches"
        icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
        action={<span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{incidents.length} Active</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {incidents.map(inc => {
            const phaseIdx = phaseOrder.indexOf(inc.phase);
            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeIncidentId === inc.id ? "bg-white/[0.04] border-l-red-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <h4 className="text-sm font-medium text-white leading-snug">{inc.title}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{inc.id}</p>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", severityColors[inc.severity])}>
                    {inc.severity}
                  </span>
                </div>

                {/* Incident Phase Progress */}
                <div className="mt-3 mb-3">
                  <div className="flex items-center gap-0.5">
                    {phaseOrder.map((phase, idx) => (
                      <div key={phase} className="flex-1 flex items-center">
                        <div className={cn("h-1.5 rounded-full flex-1",
                          idx <= phaseIdx ? phaseColors[phaseOrder[phaseIdx]] : "bg-white/10"
                        )} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-gray-500">Detect</span>
                    <span className="text-[9px] font-bold text-white flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> {inc.phase}
                    </span>
                    <span className="text-[8px] text-gray-500">Recover</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Category</p>
                    <p className="text-xs font-medium text-gray-300 mt-0.5">{inc.category}</p>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Assigned</p>
                    <p className="text-xs font-medium text-gray-300 mt-0.5 truncate">{inc.assignedTo}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {inc.affectedSystems.map(sys => (
                    <span key={sys} className="text-[9px] bg-red-500/5 border border-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono">{sys}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
