import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedpandaConsole } from '../hooks/useRedpandaConsole';
import type { ConsoleSession } from '../types/redpanda-console.types';

export const ConsoleSessionsPanel: React.FC = () => {
  const { useSessions } = useRedpandaConsole();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: 'sess-100', user_id: 'data-eng-01', started_at: new Date(Date.now() - 3600000).toISOString(), ended_at: null },
    { id: 'sess-099', user_id: 'sre-admin-04', started_at: new Date(Date.now() - 86400000).toISOString(), ended_at: new Date(Date.now() - 82800000).toISOString() }
  ];

  if (isLoading) return <div>Loading console sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Operator Console Sessions" />
      <CardBody>
        <div className="space-y-4">
          {sessions.map((sess: ConsoleSession) => (
            <div key={sess.id} className={`p-4 border-l-4 rounded bg-white/5 border border-white/10 ${
              !sess.ended_at ? 'border-l-red-500' : 'border-l-gray-600'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-blue-400">{sess.user_id}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${!sess.ended_at ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-600/20 text-gray-400'}`}>
                  {!sess.ended_at ? 'LIVE' : 'CLOSED'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>Start: {new Date(sess.started_at).toLocaleTimeString()}</span>
                <span>{sess.ended_at ? `End: ${new Date(sess.ended_at).toLocaleTimeString()}` : 'Session Active'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
