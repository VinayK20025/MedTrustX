import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useLoki } from '../hooks/useLoki';
import type { LogIndex } from '../types/loki.types';

export const LogIndexPanel: React.FC = () => {
  const { useIndex } = useLoki();
  const { data: response, isLoading } = useIndex();

  const index = response?.data || [
    { id: 'idx-1', label_key: 'service', label_value: 'clinical-api', stream_id: 'stream-1' },
    { id: 'idx-2', label_key: 'level', label_value: 'error', stream_id: 'stream-1' },
    { id: 'idx-3', label_key: 'service', label_value: 'iam-service', stream_id: 'stream-2' },
    { id: 'idx-4', label_key: 'level', label_value: 'warn', stream_id: 'stream-2' },
    { id: 'idx-5', label_key: 'service', label_value: 'billing-service', stream_id: 'stream-3' },
  ];

  if (isLoading) return <div>Loading log index...</div>;

  // Group by label_key
  const grouped = index.reduce((acc: Record<string, LogIndex[]>, idx: LogIndex) => {
    if (!acc[idx.label_key]) acc[idx.label_key] = [];
    acc[idx.label_key].push(idx);
    return acc;
  }, {});

  return (
    <Card className="h-full">
      <CardHeader title="Label Index Registry" />
      <CardBody>
        <div className="space-y-4">
          {Object.entries(grouped).map(([key, values]) => (
            <div key={key} className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">{key}</h4>
              <div className="flex flex-wrap gap-2">
                {(values as LogIndex[]).map((v) => (
                  <div key={v.id} className="flex items-center gap-2 text-[10px] bg-black/40 px-2 py-1.5 rounded-full border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-gray-300 font-mono">{v.label_value}</span>
                    <span className="text-gray-600">→ {v.stream_id}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
