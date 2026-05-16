import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCoturn } from '../hooks/useCoturn';
import type { TurnSession } from '../types/coturn.types';

export const TurnSessionsPanel: React.FC = () => {
  const { useSessions } = useCoturn();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: 'sess-1', user_id: 'u-123', session_id: 'turn-9981-ab', relay_ip: '10.0.8.44', started_at: '2026-05-02T13:00:00Z', ended_at: null },
    { id: 'sess-2', user_id: 'u-456', session_id: 'turn-8821-cd', relay_ip: '10.0.8.45', started_at: '2026-05-02T12:30:00Z', ended_at: '2026-05-02T13:15:00Z' },
    { id: 'sess-3', user_id: 'u-789', session_id: 'turn-7711-ef', relay_ip: '10.0.8.44', started_at: '2026-05-02T13:45:00Z', ended_at: null },
  ];

  if (isLoading) return <div>Loading sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="STUN/TURN Sessions" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Session ID</th>
                <th className="px-4 py-3">Relay IP</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess: TurnSession) => (
                <tr key={sess.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">{sess.session_id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{sess.relay_ip}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{sess.user_id.split('-')[1]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {new Date(sess.started_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      !sess.ended_at ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {!sess.ended_at ? 'Active' : 'Ended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};
