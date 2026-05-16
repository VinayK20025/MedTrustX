import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSecurityIncident } from '../hooks/useSecurityIncident';
import type { Responder } from '../types/security-incident.types';

export const RespondersPanel: React.FC = () => {
  const { useResponders } = useSecurityIncident();
  const { data: response, isLoading } = useResponders();

  const responders = response?.data || [
    { id: '1', user_id: 'sec-officer-01', role: 'Security Lead', status: 'dispatched', assigned_at: new Date().toISOString() },
    { id: '2', user_id: 'sec-officer-03', role: 'Field Agent', status: 'available', assigned_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading responders...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Incident Responders" />
      <CardBody>
        <div className="space-y-3">
          {responders.map((r: Responder) => (
            <div key={r.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{r.user_id}</p>
                <p className="text-xs text-gray-500 mt-1">{r.role}</p>
              </div>
              <Badge variant={r.status === 'dispatched' ? 'warning' : 'success'}>
                {r.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
