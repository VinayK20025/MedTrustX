import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useLoki } from '../hooks/useLoki';
import type { LogEntry } from '../types/loki.types';

export const LogEntriesPanel: React.FC = () => {
  const { useEntries } = useLoki();
  const { data: response, isLoading } = useEntries();

  const entries = response?.data || [
    { id: 'e-001', stream_id: 'stream-1', timestamp: new Date(Date.now() - 2000).toISOString(), log: 'ERROR [clinical-api] NullPointerException in PatientService.getById() at line 142' },
    { id: 'e-002', stream_id: 'stream-2', timestamp: new Date(Date.now() - 5000).toISOString(), log: 'WARN  [iam-service] Token refresh attempted with expired refresh_token for user sub=9c81fa' },
    { id: 'e-003', stream_id: 'stream-3', timestamp: new Date(Date.now() - 8000).toISOString(), log: 'INFO  [billing-service] Invoice INV-4492 generated successfully for tenant org-44' },
    { id: 'e-004', stream_id: 'stream-1', timestamp: new Date(Date.now() - 14000).toISOString(), log: 'ERROR [clinical-api] DB connection pool exhausted — retrying in 500ms' },
  ];

  if (isLoading) return <div>Loading log entries...</div>;

  const levelFromLog = (log: string) => {
    if (log.startsWith('ERROR')) return { color: 'text-red-400', bg: 'bg-red-500/10' };
    if (log.startsWith('WARN')) return { color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { color: 'text-blue-400', bg: 'bg-blue-500/5' };
  };

  return (
    <Card className="h-full">
      <CardHeader title="Live Log Tail" />
      <CardBody>
        <div className="bg-black/60 rounded-lg p-3 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
          {entries.map((e: LogEntry) => {
            const { color, bg } = levelFromLog(e.log);
            return (
              <div key={e.id} className={`flex gap-3 p-2 rounded ${bg}`}>
                <span className="text-gray-600 shrink-0 text-[10px]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                <span className={`${color} break-all leading-relaxed`}>{e.log}</span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
