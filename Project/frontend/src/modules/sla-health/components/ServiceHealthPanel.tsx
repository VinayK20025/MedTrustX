import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSlaHealth } from '../hooks/useSlaHealth';
import type { ServiceHealth } from '../types/sla-health.types';

export const ServiceHealthPanel: React.FC = () => {
  const { useHealthStatus } = useSlaHealth();
  const { data: response, isLoading } = useHealthStatus();

  const healthData = response?.data || [
    { id: '1', service_name: 'Patient Record Service', health_score: 100.0, status: 'healthy' },
    { id: '2', service_name: 'Billing Gateway', health_score: 88.5, status: 'degraded' },
    { id: '3', service_name: 'Radiology Imaging API', health_score: 45.0, status: 'critical' }
  ];

  if (isLoading) return <div>Loading service health...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'critical': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Real-Time Service Health" />
      <CardBody>
        <div className="space-y-3">
          {healthData.map((h: ServiceHealth) => (
            <div key={h.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{h.service_name}</p>
                <div className="w-48 bg-gray-700 h-1.5 rounded-full mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${h.health_score > 95 ? 'bg-emerald-500' : h.health_score > 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{ width: `${h.health_score}%` }} 
                  />
                </div>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant(h.status)}>
                  {h.status.toUpperCase()}
                </Badge>
                <p className="text-xs font-mono text-gray-400 mt-1">{h.health_score.toFixed(1)} / 100</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
