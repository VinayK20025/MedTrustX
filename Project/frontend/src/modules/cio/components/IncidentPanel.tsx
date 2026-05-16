'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Incident } from '../types/cio.types';
import { Flame } from 'lucide-react';
import { useAcknowledgeIncident } from '../hooks/useCioAnalytics';

interface IncidentPanelProps {
  incidents: Incident[];
}

export function IncidentPanel({ incidents }: IncidentPanelProps) {
  const { mutate: ackIncident, isPending } = useAcknowledgeIncident();

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'p1': return 'bg-emergency text-white';
      case 'p2': return 'bg-emergency/20 text-emergency-light border border-emergency/30';
      case 'p3': return 'bg-warning/20 text-warning-light border border-warning/30';
      default: return 'bg-white/10 text-gray-300 border border-white/20';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Active Incidents</h3>
            <p className="text-xs text-gray-400 mt-0.5">Major system outages and P1/P2 trackers</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-[10px] text-gray-500 uppercase">
                  {incident.status}
                </span>
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-1.5">{incident.id}: {incident.title}</h4>
              
              <div className="flex flex-col gap-1 text-[10px] text-gray-400 mb-4">
                <span>System: <span className="text-indigo-300">{incident.system}</span></span>
                <span>Responder: {incident.assignedTo || 'Unassigned'}</span>
                <span>T+ {Math.round((Date.now() - new Date(incident.createdAt).getTime()) / 60000)} mins</span>
              </div>
              
              {incident.status === 'open' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full text-xs h-7"
                  onClick={() => ackIncident(incident.id)}
                  disabled={isPending}
                >
                  Acknowledge Incident
                </Button>
              )}
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="p-8 text-center text-gray-500">No active incidents (Zero P1/P2/P3)</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
