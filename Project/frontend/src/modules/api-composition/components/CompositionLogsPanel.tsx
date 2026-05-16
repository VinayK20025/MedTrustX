import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useApiComposition } from '../hooks/useApiComposition';
import type { CompositionLog } from '../types/api-composition.types';

export const CompositionLogsPanel: React.FC = () => {
  const { useLogs } = useApiComposition();
  const { data: response, isLoading } = useLogs();

  const logs = response?.data || [
    { id: 'log-A1', composition_id: 'Patient 360 Aggregate View', status: 'success', response_time: 145 },
    { id: 'log-A2', composition_id: 'Patient 360 Aggregate View', status: 'partial_success', response_time: 210 },
    { id: 'log-B1', composition_id: 'Executive Financial Summary', status: 'failed', response_time: 5003 }
  ];

  if (isLoading) return <div>Loading execution logs...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'success': return 'success';
      case 'partial_success': return 'warning';
      case 'failed': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Composition Execution Logs" />
      <CardBody>
        <div className="space-y-4">
          {logs.map((l: CompositionLog) => (
            <div key={l.id} className={`p-4 border-l-4 rounded bg-white/5 border border-white/10 ${
              l.status === 'success' ? 'border-l-emerald-500' : l.status === 'failed' ? 'border-l-red-500' : 'border-l-amber-500'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-200 truncate pr-4">{l.composition_id}</span>
                <Badge variant={statusVariant(l.status)}>
                  {l.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-gray-500 font-mono">Trace: {l.id}</span>
                <span className={`${l.response_time > 1000 ? 'text-red-400' : 'text-blue-400'} font-mono`}>
                  {l.response_time}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
