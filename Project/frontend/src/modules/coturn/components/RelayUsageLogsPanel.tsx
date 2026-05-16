import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCoturn } from '../hooks/useCoturn';
import type { RelayUsageLog } from '../types/coturn.types';

export const RelayUsageLogsPanel: React.FC = () => {
  const { useUsageLogs } = useCoturn();
  const { data: response, isLoading } = useUsageLogs();

  const logs = response?.data || [
    { id: 'log-1', session_id: 'turn-9981-ab', bytes_transferred: 45899210 },
    { id: 'log-2', session_id: 'turn-8821-cd', bytes_transferred: 104857600 },
    { id: 'log-3', session_id: 'turn-7711-ef', bytes_transferred: 890123 },
  ];

  if (isLoading) return <div>Loading usage logs...</div>;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="h-full">
      <CardHeader title="Relay Bandwidth Usage" />
      <CardBody>
        <div className="space-y-4">
          {logs.map((log: RelayUsageLog) => {
            const isHigh = log.bytes_transferred > 50000000;
            return (
              <div key={log.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-purple-400">{log.session_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isHigh ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {formatBytes(log.bytes_transferred)}
                  </span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${isHigh ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((log.bytes_transferred / 150000000) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
