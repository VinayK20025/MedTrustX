import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAlertCorrelation } from '../hooks/useAlertCorrelation';
import type { Alert } from '../types/alert-correlation.types';

export const AlertsPanel: React.FC = () => {
  const { useAlerts } = useAlertCorrelation();
  const { data: response, isLoading } = useAlerts();

  const alerts = response?.data || [
    { id: '1', source: 'prometheus', type: 'cpu_high', severity: 'critical', payload: { host: 'node-01', cpu_usage: 98 } },
    { id: '2', source: 'loki', type: 'latency_spike', severity: 'high', payload: { service: 'auth-api', latency: '2000ms' } },
    { id: '3', source: 'iot-messaging', type: 'device_offline', severity: 'medium', payload: { device_id: 'iv-pump-74' } }
  ];

  if (isLoading) return <div>Loading raw alerts...</div>;

  const severityVariant = (s: string) => {
    switch (s) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'outline';
      case 'low': return 'success';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Raw Alert Stream" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((a: Alert) => (
            <div key={a.id} className={`p-4 border-l-4 rounded-lg bg-white/5 border border-white/10 ${
              a.severity === 'critical' ? 'border-l-red-500' : a.severity === 'high' ? 'border-l-amber-500' : 'border-l-blue-500'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold capitalize text-gray-200">{a.type.replace(/_/g, ' ')}</span>
                <Badge variant={severityVariant(a.severity)}>
                  {a.severity.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 font-mono mb-2">Source: <span className="text-blue-300">{a.source}</span></div>
              <div className="bg-black/40 p-2 rounded text-[10px] text-gray-500 font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(a.payload)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
