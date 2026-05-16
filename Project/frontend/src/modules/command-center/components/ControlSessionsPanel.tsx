import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCommandCenter } from '../hooks/useCommandCenter';
import type { ControlSession } from '../types/command-center.types';

export const ControlSessionsPanel: React.FC = () => {
  const { useSessions } = useCommandCenter();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: 'sess-8821', operator_id: 'ops-admin-smith', started_at: new Date(Date.now() - 7200000).toISOString(), ended_at: null },
    { id: 'sess-8820', operator_id: 'sre-jones', started_at: new Date(Date.now() - 86400000).toISOString(), ended_at: new Date(Date.now() - 82800000).toISOString() }
  ];

  if (isLoading) return <div>Loading control sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Operator Control Sessions" />
      <CardBody>
        <div className="space-y-4">
          {sessions.map((sess: ControlSession) => (
            <div key={sess.id} className={`p-4 border-l-4 rounded bg-white/5 border border-white/10 ${
              !sess.ended_at ? 'border-l-emerald-500' : 'border-l-gray-600'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-blue-400">{sess.operator_id}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${!sess.ended_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/20 text-gray-400'}`}>
                  {!sess.ended_at ? 'ACTIVE' : 'ENDED'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>Start: {new Date(sess.started_at).toLocaleTimeString()}</span>
                <span>{sess.ended_at ? `End: ${new Date(sess.ended_at).toLocaleTimeString()}` : 'In Progress...'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
