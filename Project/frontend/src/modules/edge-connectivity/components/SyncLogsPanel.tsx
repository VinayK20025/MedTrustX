import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEdgeConnectivity } from '../hooks/useEdgeConnectivity';
import type { SyncLog } from '../types/edge-connectivity.types';

export const SyncLogsPanel: React.FC = () => {
  const { useSyncLogs } = useEdgeConnectivity();
  const { data: response, isLoading } = useSyncLogs();

  const logs = response?.data || [
    { id: '1', node_id: '1', sync_status: 'completed', data_volume: 524288000 },
    { id: '2', node_id: '2', sync_status: 'in_progress', data_volume: 134217728 }
  ];

  if (isLoading) return <div>Loading sync logs...</div>;

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'failed': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Data Sync Logs" />
      <CardBody>
        <div className="space-y-3">
          {logs.map((log: SyncLog) => (
            <div key={log.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">Node: {log.node_id}</p>
                <p className="text-xs text-gray-500 mt-1">Volume: {formatBytes(log.data_volume)}</p>
              </div>
              <Badge variant={statusVariant(log.sync_status)}>
                {log.sync_status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
