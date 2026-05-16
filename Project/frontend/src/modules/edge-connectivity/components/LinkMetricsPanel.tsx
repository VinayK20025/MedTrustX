import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useEdgeConnectivity } from '../hooks/useEdgeConnectivity';
import type { LinkMetric } from '../types/edge-connectivity.types';

export const LinkMetricsPanel: React.FC = () => {
  const { useLinkMetrics } = useEdgeConnectivity();
  const { data: response, isLoading } = useLinkMetrics();

  const metrics = response?.data || [
    { id: '1', node_id: '1', latency: 12.5, bandwidth: 95.2, packet_loss: 0.01, timestamp: new Date().toISOString() },
    { id: '2', node_id: '2', latency: 85.3, bandwidth: 42.1, packet_loss: 2.35, timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading link metrics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Link Health Metrics" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((m: LinkMetric) => (
            <div key={m.id} className="p-4 bg-white/5 rounded-md border border-white/10">
              <p className="text-sm font-semibold mb-3">Node: {m.node_id}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Latency</p>
                  <p className={`text-lg font-bold ${m.latency < 50 ? 'text-emerald-400' : 'text-red-400'}`}>{m.latency.toFixed(1)}ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bandwidth</p>
                  <p className="text-lg font-bold text-blue-400">{m.bandwidth.toFixed(1)}Mbps</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pkt Loss</p>
                  <p className={`text-lg font-bold ${m.packet_loss < 1 ? 'text-emerald-400' : 'text-red-400'}`}>{m.packet_loss.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
