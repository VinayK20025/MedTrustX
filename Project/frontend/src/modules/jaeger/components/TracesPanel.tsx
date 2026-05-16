import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJaeger } from '../hooks/useJaeger';
import type { Trace } from '../types/jaeger.types';

const formatDuration = (us: number): string => {
  if (us < 1000) return `${us}μs`;
  if (us < 1000000) return `${(us / 1000).toFixed(2)}ms`;
  return `${(us / 1000000).toFixed(2)}s`;
};

export const TracesPanel: React.FC = () => {
  const { useTraces } = useJaeger();
  const { data: response, isLoading } = useTraces();

  const traces = response?.data || [
    { id: '1', trace_id: 'abc123ef89012345', service_name: 'clinical-api', duration: 142800, started_at: new Date(Date.now() - 5000).toISOString() },
    { id: '2', trace_id: 'def456ab12345678', service_name: 'iam-service', duration: 8200, started_at: new Date(Date.now() - 12000).toISOString() },
    { id: '3', trace_id: 'fed789cd98765432', service_name: 'billing-service', duration: 890000, started_at: new Date(Date.now() - 30000).toISOString() },
  ];

  if (isLoading) return <div>Loading traces...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Distributed Traces" />
      <CardBody>
        <div className="space-y-3">
          {traces.map((t: Trace) => (
            <div key={t.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-400">{t.service_name}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{t.trace_id}</span>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold font-mono ${t.duration > 500000 ? 'text-red-400' : t.duration > 100000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatDuration(t.duration)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">{new Date(t.started_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
