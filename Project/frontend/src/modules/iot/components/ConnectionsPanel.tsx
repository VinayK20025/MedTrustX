import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useIot } from '../hooks/useIot';
import type { DeviceConnection } from '../types/iot.types';

export const ConnectionsPanel: React.FC = () => {
  const { useConnections } = useIot();
  const { data: response, isLoading } = useConnections();

  const connections = response?.data || [
    { id: 'conn-1', device_id: 'dev-infusion-1A', status: 'connected', connected_at: '2026-05-02T13:00:00Z' },
    { id: 'conn-2', device_id: 'dev-ekg-4B', status: 'disconnected', connected_at: '2026-05-02T11:45:00Z' },
    { id: 'conn-3', device_id: 'dev-ventilator-9C', status: 'connected', connected_at: '2026-05-02T14:05:00Z' },
  ];

  if (isLoading) return <div>Loading connections...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Device Connections" />
      <CardBody>
        <div className="space-y-3">
          {connections.map((conn: DeviceConnection) => (
            <div key={conn.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${conn.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <div>
                  <h3 className="font-semibold text-sm text-gray-200">{conn.device_id}</h3>
                  <span className="text-[10px] text-gray-500 font-mono">Last Seen: {new Date(conn.connected_at).toLocaleTimeString()}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                conn.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {conn.status}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
