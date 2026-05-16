import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJitsi } from '../hooks/useJitsi';
import type { MediaLog } from '../types/jitsi.types';

export const MediaLogsPanel: React.FC = () => {
  const { useMediaLogs } = useJitsi();
  const { data: response, isLoading } = useMediaLogs();

  const logs = response?.data || [
    { id: 'ml-1', session_id: 'sess-1', event_type: 'VIDEO_MUTED', payload: { user_id: 'u-405' } },
    { id: 'ml-2', session_id: 'sess-1', event_type: 'SCREEN_SHARE_STARTED', payload: { user_id: 'u-101', resolution: '1080p' } },
    { id: 'ml-3', session_id: 'sess-3', event_type: 'BANDWIDTH_ADJUSTMENT', payload: { action: 'downgrade', quality: 'SD' } },
  ];

  if (isLoading) return <div>Loading media logs...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Media Analytics Stream" />
      <CardBody>
        <div className="space-y-3">
          {logs.map((log: MediaLog) => (
            <div key={log.id} className="p-3 border border-white/10 rounded-lg bg-[#0d1117] font-mono text-xs overflow-x-auto">
              <div className="flex gap-4 mb-2 border-b border-white/10 pb-2">
                <span className="text-purple-400">session: <span className="text-gray-300">{log.session_id}</span></span>
                <span className="text-amber-400">event: <span className="text-gray-300">{log.event_type}</span></span>
              </div>
              <pre className="text-gray-400 m-0 p-0 bg-transparent">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
