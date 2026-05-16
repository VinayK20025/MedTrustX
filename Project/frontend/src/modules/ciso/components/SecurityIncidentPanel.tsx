'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SecurityIncident } from '../types/ciso.types';
import { Flame, Clock } from 'lucide-react';
import { useContainIncident } from '../hooks/useCisoAnalytics';

interface IncidentPanelProps {
  incidents: SecurityIncident[];
}

const severityColor: Record<string, string> = {
  critical: 'bg-emergency text-white',
  high: 'bg-emergency/20 text-emergency-light border border-emergency/30',
  medium: 'bg-warning/20 text-warning-light border border-warning/30',
  low: 'bg-white/10 text-gray-300 border border-white/20',
};

const statusColor: Record<string, string> = {
  open: 'text-emergency-light',
  investigating: 'text-warning-light',
  contained: 'text-indigo-400',
  resolved: 'text-success-light',
};

const categoryLabels: Record<string, string> = {
  breach: 'Breach',
  unauthorized_access: 'Unauthorized Access',
  policy_violation: 'Policy Violation',
  malware: 'Malware',
  insider_threat: 'Insider Threat',
};

export function SecurityIncidentPanel({ incidents }: IncidentPanelProps) {
  const { mutate: containIncident, isPending } = useContainIncident();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Incident Response</h3>
            <p className="text-xs text-gray-400 mt-0.5">Active security incidents & response tracking</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[400px]">
        {incidents.map((incident) => (
          <div key={incident.id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${severityColor[incident.severity]}`}>
                  {incident.severity}
                </span>
                <span className="text-[10px] text-gray-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  {categoryLabels[incident.category] || incident.category}
                </span>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${statusColor[incident.status]}`}>
                ● {incident.status}
              </span>
            </div>
            
            <h4 className="text-sm font-semibold text-white mb-2">{incident.id}: {incident.title}</h4>
            
            <div className="flex flex-wrap gap-1.5 mb-3">
              {incident.affectedSystems.map(sys => (
                <span key={sys} className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                  {sys}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono mb-3">
              {incident.ttd != null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  TTD: {incident.ttd}m
                </span>
              )}
              {incident.ttr != null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  TTR: {incident.ttr}m
                </span>
              )}
              <span>Responder: {incident.assignedTo || 'Unassigned'}</span>
            </div>

            {(incident.status === 'open' || incident.status === 'investigating') && (
              <Button 
                variant="primary" 
                size="sm" 
                className="w-full text-xs h-7 bg-emergency/80 hover:bg-emergency"
                onClick={() => containIncident(incident.id)}
                disabled={isPending}
              >
                {incident.status === 'open' ? 'Investigate' : 'Contain Incident'}
              </Button>
            )}
          </div>
        ))}
        {incidents.length === 0 && (
          <div className="p-8 text-center text-gray-500">No active security incidents</div>
        )}
      </CardBody>
    </Card>
  );
}
