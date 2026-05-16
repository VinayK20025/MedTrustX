import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAlertCorrelation } from '../hooks/useAlertCorrelation';
import type { CorrelatedIncident } from '../types/alert-correlation.types';

export const CorrelatedIncidentsPanel: React.FC = () => {
  const { useIncidents } = useAlertCorrelation();
  const { data: response, isLoading } = useIncidents();

  const incidents = response?.data || [
    { id: '1', incident_key: 'INC-DB-LOCK', root_cause: 'Deadlock in Core Database', severity: 'critical', status: 'investigating' },
    { id: '2', incident_key: 'INC-NET-DROP', root_cause: 'Router Flap on Floor 3', severity: 'high', status: 'open' }
  ];

  if (isLoading) return <div>Loading incidents...</div>;

  const severityVariant = (s: string) => {
    switch (s) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'outline';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Correlated Incidents" />
      <CardBody>
        <div className="space-y-4">
          {incidents.map((inc: CorrelatedIncident) => (
            <div key={inc.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-red-400">{inc.incident_key}</span>
                <Badge variant={severityVariant(inc.severity)}>
                  {inc.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-300 font-medium mb-3">
                {inc.root_cause || 'Root cause unknown...'}
              </p>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                  inc.status === 'open' ? 'bg-red-500/20 text-red-400' : 
                  inc.status === 'investigating' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {inc.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 font-mono">ID: {inc.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
