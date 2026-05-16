import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import type { NetworkSession } from '../types/zero-trust-network.types';

export const NetworkSessionsPanel: React.FC = () => {
  const { useSessions } = useZeroTrustNetwork();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: '1', user_id: 'dr-patel', device_id: 'workstation-icu-05', status: 'active', started_at: new Date().toISOString(), ended_at: null },
    { id: '2', user_id: 'nurse-singh', device_id: 'tablet-ward-3b', status: 'terminated', started_at: new Date(Date.now() - 3600000).toISOString(), ended_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Validated Sessions" />
      <CardBody>
        <div className="space-y-3">
          {sessions.map((s: NetworkSession) => (
            <div key={s.id} className="p-3 bg-white/5 rounded border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-200">{s.user_id}</span>
                <Badge variant={s.status === 'active' ? 'success' : 'outline'}>
                  {s.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Device: {s.device_id}</p>
              <p className="text-xs text-gray-500">Started: {new Date(s.started_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
