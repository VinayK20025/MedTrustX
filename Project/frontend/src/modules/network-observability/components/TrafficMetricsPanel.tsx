import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNetworkObservability } from '../hooks/useNetworkObservability';
import type { TrafficMetric } from '../types/network-observability.types';

export const TrafficMetricsPanel: React.FC = () => {
  const { useTrafficMetrics } = useNetworkObservability();
  const { data: response, isLoading } = useTrafficMetrics();

  const metrics = response?.data || [
    { id: '1', metric_name: 'avg_latency_ms', value: 14.2, timestamp: new Date().toISOString() },
    { id: '2', metric_name: 'packet_loss_pct', value: 0.03, timestamp: new Date().toISOString() },
    { id: '3', metric_name: 'total_throughput_gbps', value: 8.7, timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading traffic metrics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Traffic Statistics" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((m: TrafficMetric) => (
            <div key={m.id} className="p-4 bg-white/5 rounded-md border border-white/10 text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">{m.metric_name.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-emerald-400">{m.value}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
