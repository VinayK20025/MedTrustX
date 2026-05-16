import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePhysicalAccess } from '../hooks/usePhysicalAccess';
import type { AccessLog } from '../types/physical-access.types';

export const AccessLogsPanel: React.FC = () => {
  const { useLogs } = usePhysicalAccess();
  const { data: response, isLoading } = useLogs();

  const logs = response?.data || [
    { id: '1', user_id: 'dr-sarah-jenkins', access_point_id: 'ICU Ward Door', action: 'entry', status: 'granted', created_at: new Date().toISOString() },
    { id: '2', user_id: 'unknown', access_point_id: 'Pharmacy Vault', action: 'entry', status: 'denied', created_at: new Date().toISOString() },
    { id: '3', user_id: 'dr-sarah-jenkins', access_point_id: 'ICU Ward Door', action: 'exit', status: 'granted', created_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading access logs...</div>;

  const actionIcon = (a: string) => {
    switch (a) {
      case 'entry': return '➡️';
      case 'exit': return '⬅️';
      default: return '🔘';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Access Audit Trail" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {logs.map((log: AccessLog) => (
            <li key={log.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${log.status === 'granted' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex items-center gap-2 mb-1">
                <span>{actionIcon(log.action)}</span>
                <span className="text-sm font-semibold">
                  {log.user_id || <span className="text-red-400 italic">Unknown Subject</span>}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.status === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {log.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                <span className="capitalize">{log.action} attempt</span> @ {log.access_point_id}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
