import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePerformanceIntelligence } from '../hooks/usePerformanceIntelligence';
import type { PerformanceMetric } from '../types/performance-intelligence.types';

export const PerformanceMetricsPanel: React.FC = () => {
  const { useMetrics } = usePerformanceIntelligence();
  const { data: response, isLoading } = useMetrics();

  const metrics = response?.data || [
    { id: '1', service_name: 'clinical-service', metric_name: 'p99_latency', value: 120.5, timestamp: new Date().toISOString() },
    { id: '2', service_name: 'billing-service', metric_name: 'error_rate', value: 0.05, timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading metrics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Live Performance Metrics" />
      <CardBody>
        <div className="space-y-4">
          {metrics.map((metric: PerformanceMetric) => (
            <div key={metric.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{metric.service_name}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{metric.metric_name.replace('_', ' ')}</p>
              </div>
              <Badge variant="outline">
                {metric.value.toFixed(2)}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
