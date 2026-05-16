'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { AlertTriangle, ShieldAlert, Crosshair, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { SiemAlert, SecurityIncident } from '../types/soc-analyst.types';

interface AlertFeedPanelProps {
  alerts: SiemAlert[];
  incidents: SecurityIncident[];
  activeIncidentId?: string;
  onSelectIncident: (id: string) => void;
  onAssignAlert: (id: string) => void;
}

const severityColors: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
};

export const AlertFeedPanel: React.FC<AlertFeedPanelProps> = ({ alerts, incidents, activeIncidentId, onSelectIncident, onAssignAlert }) => {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Active Incidents (Top Priority) */}
      <Card className="flex flex-col border-white/[0.06] shadow-glass bg-surface-dark shrink-0 max-h-[40%]">
        <CardHeader
          title="Active Incidents"
          icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
          action={<span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{incidents.length} Open</span>}
        />
        <CardBody className="overflow-y-auto p-0">
          <div className="divide-y divide-white/[0.04]">
            {incidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={cn(
                  "p-3 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeIncidentId === inc.id ? "bg-white/[0.04] border-l-red-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-medium text-white leading-snug">{inc.title}</h4>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ml-2", severityColors[inc.severity])}>
                    {inc.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-gray-500 font-mono">{inc.id}</p>
                  <p className="text-[9px] text-gray-400">Assigned: {inc.assignedTo}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Raw Alert Feed */}
      <Card className="flex-1 flex flex-col border-white/[0.06] shadow-glass bg-surface-dark min-h-0">
        <CardHeader
          title="SIEM Alert Stream"
          icon={<Crosshair className="w-4 h-4 text-indigo-400" />}
        />
        <CardBody className="flex-1 overflow-y-auto p-0">
          <div className="divide-y divide-white/[0.04]">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("w-4 h-4 shrink-0", 
                      alert.severity === 'Critical' ? "text-red-400" :
                      alert.severity === 'High' ? "text-orange-400" :
                      "text-amber-400"
                    )} />
                    <h4 className="text-sm font-medium text-white">{alert.ruleName}</h4>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-3">{alert.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" /> <span className="font-mono text-gray-300">{alert.source}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 justify-end">
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/[0.04]">
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded border",
                    alert.status === 'Unassigned' ? "bg-gray-500/10 text-gray-400 border-gray-500/30" :
                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  )}>{alert.status}</span>
                  
                  {alert.status === 'Unassigned' && (
                    <Button size="sm" variant="outline" className="h-6 px-3 text-[9px]" onClick={() => onAssignAlert(alert.id)}>
                      Investigate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
