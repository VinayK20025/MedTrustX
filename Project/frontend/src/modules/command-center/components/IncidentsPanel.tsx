import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCommandCenter } from '../hooks/useCommandCenter';
import type { Incident } from '../types/command-center.types';

export const IncidentsPanel: React.FC = () => {
  const { useIncidents } = useCommandCenter();
  const { data: response, isLoading } = useIncidents();

  const incidents = response?.data || [
    { id: '1', type: 'system_failure', severity: 'critical', status: 'investigating' },
    { id: '2', type: 'security_breach', severity: 'high', status: 'mitigating' },
    { id: '3', type: 'performance_degradation', severity: 'medium', status: 'open' }
  ];

  if (isLoading) return <div>Loading incidents...</div>;

  const severityVariant = (s: string) => {
    switch (s) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'outline';
      case 'low': return 'success';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Active Incidents Overview" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incidents.map((inc: Incident) => (
            <div key={inc.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-semibold capitalize text-gray-200">
                  {inc.type.replace(/_/g, ' ')}
                </span>
                <Badge variant={severityVariant(inc.severity)}>
                  {inc.severity.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                  inc.status === 'open' ? 'bg-red-500/20 text-red-400' :
                  inc.status === 'investigating' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {inc.status}
                </span>
                <span className="text-xs text-gray-500 font-mono">#{inc.id}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
