import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkObservability } from '../hooks/useNetworkObservability';
import type { Anomaly } from '../types/network-observability.types';

export const AnomaliesPanel: React.FC = () => {
  const { useAnomalies } = useNetworkObservability();
  const { data: response, isLoading } = useAnomalies();

  const anomalies = response?.data || [
    { id: '1', type: 'latency_spike', severity: 'high', details: { service: 'billing-service', peak_ms: 450 } },
    { id: '2', type: 'dos_suspected', severity: 'critical', details: { source_ip: '203.0.113.42', pps: 125000 } }
  ];

  if (isLoading) return <div>Loading anomalies...</div>;

  const severityVariant = (s: string) => {
    switch (s) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Detected Anomalies" />
      <CardBody>
        <div className="space-y-4">
          {anomalies.map((a: Anomaly) => (
            <div key={a.id} className="p-4 border border-white/10 rounded-lg bg-white/5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold capitalize">{a.type.replace('_', ' ')}</span>
                <Badge variant={severityVariant(a.severity)}>
                  {a.severity.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                {Object.entries(a.details).map(([k, v]) => (
                  <span key={k} className="mr-3">
                    <span className="text-gray-500 capitalize">{k.replace('_', ' ')}:</span>{' '}
                    <span className="text-white font-medium">{String(v)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
