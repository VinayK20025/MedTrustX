import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePerformanceIntelligence } from '../hooks/usePerformanceIntelligence';
import type { Benchmark } from '../types/performance-intelligence.types';

export const BenchmarksPanel: React.FC = () => {
  const { useBenchmarks } = usePerformanceIntelligence();
  const { data: response, isLoading } = useBenchmarks();

  const benchmarks = response?.data || [
    { id: '1', service_name: 'clinical-service', metric_name: 'p99_latency', baseline: 150.0 },
    { id: '2', service_name: 'billing-service', metric_name: 'error_rate', baseline: 0.1 }
  ];

  if (isLoading) return <div>Loading benchmarks...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Reference Benchmarks" />
      <CardBody>
        <ul className="space-y-3">
          {benchmarks.map((bm: Benchmark) => (
            <li key={bm.id} className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-sm font-medium text-blue-400">
                {bm.service_name}
              </span>
              <div className="text-xs text-gray-500 text-right">
                <p className="capitalize">{bm.metric_name.replace('_', ' ')}</p>
                <p className="font-bold text-white mt-0.5">Baseline: {bm.baseline}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
