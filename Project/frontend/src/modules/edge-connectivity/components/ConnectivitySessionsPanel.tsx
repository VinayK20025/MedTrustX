import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEdgeConnectivity } from '../hooks/useEdgeConnectivity';
import type { ConnectivitySession } from '../types/edge-connectivity.types';

export const ConnectivitySessionsPanel: React.FC = () => {
  const { useSessions } = useEdgeConnectivity();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: '1', node_id: '1', tunnel_type: 'wireguard', status: 'active', started_at: new Date().toISOString(), ended_at: null },
    { id: '2', node_id: '2', tunnel_type: 'ipsec', status: 'reconnecting', started_at: new Date().toISOString(), ended_at: null }
  ];

  if (isLoading) return <div>Loading sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Tunnel Sessions" />
      <CardBody>
        <div className="space-y-3">
          {sessions.map((s: ConnectivitySession) => (
            <div key={s.id} className="p-3 bg-white/5 rounded border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-blue-400 uppercase">{s.tunnel_type}</span>
                <Badge variant={s.status === 'active' ? 'success' : 'warning'}>
                  {s.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Started: {new Date(s.started_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
