import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSlaHealth } from '../hooks/useSlaHealth';
import type { SlaViolation } from '../types/sla-health.types';

export const SlaViolationsPanel: React.FC = () => {
  const { useViolations } = useSlaHealth();
  const { data: response, isLoading } = useViolations();

  const violations = response?.data || [
    { id: '1', sla_id: 'SLA-102', violation_type: 'latency', severity: 'high', detected_at: new Date().toISOString() },
    { id: '2', sla_id: 'SLA-105', violation_type: 'error_rate', severity: 'critical', detected_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading violations...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="SLA Breach Alerts" />
      <CardBody>
        <div className="space-y-4">
          {violations.map((v: SlaViolation) => (
            <div key={v.id} className="p-4 border border-white/10 rounded-lg bg-white/5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{v.violation_type.replace('_', ' ')} Breach</p>
                  <p className="text-xs text-gray-500 mt-1">SLA Ref: {v.sla_id}</p>
                </div>
                <Badge variant={v.severity === 'critical' ? 'danger' : 'warning'}>
                  {v.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">{new Date(v.detected_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
