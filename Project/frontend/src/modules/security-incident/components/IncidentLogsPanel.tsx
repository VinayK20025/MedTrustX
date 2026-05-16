import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSecurityIncident } from '../hooks/useSecurityIncident';
import type { IncidentLog } from '../types/security-incident.types';

export const IncidentLogsPanel: React.FC = () => {
  const { useLogs } = useSecurityIncident();
  const { data: response, isLoading } = useLogs();

  const logs = response?.data || [
    { id: '1', incident_id: '1', event_type: 'status_change', payload: { from: 'open', to: 'investigating' } },
    { id: '2', incident_id: '1', event_type: 'responder_assigned', payload: { responder: 'sec-officer-01' } }
  ];

  if (isLoading) return <div>Loading incident logs...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Incident Audit Trail" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {logs.map((log: IncidentLog) => (
            <li key={log.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-sm font-semibold capitalize">{log.event_type.replace(/_/g, ' ')}</p>
              <div className="text-xs text-gray-400 mt-1">
                {Object.entries(log.payload).map(([k, v]) => (
                  <span key={k} className="mr-3">
                    <span className="text-gray-500 capitalize">{k}:</span>{' '}
                    <span className="text-white font-medium">{String(v)}</span>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
