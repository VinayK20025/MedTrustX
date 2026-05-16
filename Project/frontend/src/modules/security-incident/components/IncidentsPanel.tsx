import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSecurityIncident } from '../hooks/useSecurityIncident';
import type { Incident } from '../types/security-incident.types';

export const IncidentsPanel: React.FC = () => {
  const { useIncidents } = useSecurityIncident();
  const { data: response, isLoading } = useIncidents();

  const incidents = response?.data || [
    { id: '1', type: 'intrusion', severity: 'critical', status: 'investigating', location: 'Server Room B2' },
    { id: '2', type: 'medical', severity: 'high', status: 'open', location: 'Emergency Bay' },
    { id: '3', type: 'fire', severity: 'medium', status: 'resolved', location: 'Kitchen Block' }
  ];

  if (isLoading) return <div>Loading incidents...</div>;

  const severityVariant = (s: string) => {
    switch (s) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'outline';
      default: return 'success' as const;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'open': return 'text-red-400';
      case 'investigating': return 'text-amber-400';
      case 'resolved': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Active Incidents" />
      <CardBody>
        <div className="space-y-4">
          {incidents.map((inc: Incident) => (
            <div key={inc.id} className="p-4 border border-white/10 rounded-lg bg-white/5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{inc.type} Incident</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {inc.location}</p>
                </div>
                <Badge variant={severityVariant(inc.severity)}>
                  {inc.severity.toUpperCase()}
                </Badge>
              </div>
              <p className={`text-xs font-bold uppercase ${statusColor(inc.status)}`}>{inc.status}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
