import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJaeger } from '../hooks/useJaeger';
import type { Span } from '../types/jaeger.types';

const formatDuration = (us: number): string => {
  if (us < 1000) return `${us}μs`;
  if (us < 1000000) return `${(us / 1000).toFixed(2)}ms`;
  return `${(us / 1000000).toFixed(2)}s`;
};

export const SpansPanel: React.FC = () => {
  const { useSpans } = useJaeger();
  const { data: response, isLoading } = useSpans();

  const spans = response?.data || [
    { id: '1', trace_id: 'abc123ef89012345', span_id: 'span-001', parent_span_id: null, operation_name: 'HTTP POST /api/v1/patients', duration: 142800, started_at: new Date(Date.now() - 5000).toISOString() },
    { id: '2', trace_id: 'abc123ef89012345', span_id: 'span-002', parent_span_id: 'span-001', operation_name: 'db.query patients_table', duration: 98400, started_at: new Date(Date.now() - 4800).toISOString() },
    { id: '3', trace_id: 'abc123ef89012345', span_id: 'span-003', parent_span_id: 'span-001', operation_name: 'redis.get patient_cache', duration: 820, started_at: new Date(Date.now() - 4600).toISOString() },
  ];

  if (isLoading) return <div>Loading spans...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Span Waterfall" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-3">
          {spans.map((s: Span) => (
            <li key={s.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${s.parent_span_id ? 'bg-blue-400' : 'bg-amber-400'}`} />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-200 font-mono">{s.operation_name}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {s.parent_span_id
                      ? <span>Child of <span className="text-blue-400">{s.parent_span_id}</span></span>
                      : <span className="text-amber-400">Root Span</span>}
                  </p>
                </div>
                <span className={`text-sm font-bold font-mono ml-4 ${s.duration > 100000 ? 'text-red-400' : s.duration > 10000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatDuration(s.duration)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
