import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAlertCorrelation } from '../hooks/useAlertCorrelation';
import type { AlertMapping } from '../types/alert-correlation.types';

export const AlertMappingsPanel: React.FC = () => {
  const { useMappings } = useAlertCorrelation();
  const { data: response, isLoading } = useMappings();

  const mappings = response?.data || [
    { id: '1', alert_id: 'db_latency_spike', incident_id: 'INC-DB-LOCK', correlation_score: 0.98 },
    { id: '2', alert_id: 'api_timeout_auth', incident_id: 'INC-DB-LOCK', correlation_score: 0.85 }
  ];

  if (isLoading) return <div>Loading mappings...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="AI Alert-to-Incident Mappings" />
      <CardBody>
        <div className="space-y-3">
          {mappings.map((m: AlertMapping) => (
            <div key={m.id} className="p-3 border border-white/10 rounded-lg bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-emerald-500/10 z-0" style={{ width: `${m.correlation_score * 100}%` }} />
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-mono mb-1">{m.alert_id}</span>
                  <span className="text-sm font-semibold text-gray-200">→ {m.incident_id}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block mb-1">Confidence</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(m.correlation_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
