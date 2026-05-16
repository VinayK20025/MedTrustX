import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useLoki } from '../hooks/useLoki';
import type { LogStream } from '../types/loki.types';

export const LogStreamsPanel: React.FC = () => {
  const { useStreams } = useLoki();
  const { data: response, isLoading } = useStreams();

  const streams = response?.data || [
    { id: 'stream-1', labels: { service: 'clinical-api', env: 'production', level: 'error' } },
    { id: 'stream-2', labels: { service: 'iam-service', env: 'production', level: 'warn' } },
    { id: 'stream-3', labels: { service: 'billing-service', env: 'production', level: 'info' } },
  ];

  if (isLoading) return <div>Loading log streams...</div>;

  const levelColor = (level?: string) => {
    switch (level) {
      case 'error': return 'border-l-red-500';
      case 'warn': return 'border-l-amber-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Active Log Streams" />
      <CardBody>
        <div className="space-y-3">
          {streams.map((s: LogStream) => (
            <div key={s.id} className={`p-3 border-l-4 rounded bg-white/5 border border-white/10 ${levelColor(s.labels.level)}`}>
              <div className="flex flex-wrap gap-2">
                {Object.entries(s.labels).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1 text-[10px] bg-black/40 px-2 py-1 rounded font-mono">
                    <span className="text-gray-500">{k}=</span>
                    <span className={
                      v === 'error' ? 'text-red-400' :
                      v === 'warn' ? 'text-amber-400' :
                      v === 'info' ? 'text-blue-400' :
                      'text-gray-300'
                    }>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 font-mono mt-2">Stream ID: {s.id}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
