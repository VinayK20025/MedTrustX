import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNetworkManagement } from '../hooks/useNetworkManagement';
import type { DeviceMetric } from '../types/network-management.types';

export const DeviceMetricsPanel: React.FC = () => {
  const { useMetrics } = useNetworkManagement();
  const { data: response, isLoading } = useMetrics();

  const metrics = response?.data || [
    { id: '1', device_id: '1', metric_name: 'cpu_utilization', value: 42.5, timestamp: new Date().toISOString() },
    { id: '2', device_id: '1', metric_name: 'bandwidth_mbps', value: 850.0, timestamp: new Date().toISOString() },
    { id: '3', device_id: '3', metric_name: 'latency_ms', value: 3.2, timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading metrics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Device Telemetry" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((m: DeviceMetric) => (
            <div key={m.id} className="p-4 bg-white/5 rounded-md border border-white/10 text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">{m.metric_name.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-emerald-400">{m.value.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">Device: {m.device_id}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
