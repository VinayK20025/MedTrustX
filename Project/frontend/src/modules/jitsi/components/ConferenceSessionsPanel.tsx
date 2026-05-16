import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJitsi } from '../hooks/useJitsi';
import type { ConferenceSession } from '../types/jitsi.types';

export const ConferenceSessionsPanel: React.FC = () => {
  const { useSessions } = useJitsi();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: 'sess-1', room_id: 'room-1', started_at: '2026-05-02T13:00:00Z', ended_at: null, status: 'active' },
    { id: 'sess-2', room_id: 'room-2', started_at: '2026-05-02T11:30:00Z', ended_at: '2026-05-02T12:00:00Z', status: 'ended' },
    { id: 'sess-3', room_id: 'room-3', started_at: '2026-05-02T13:45:00Z', ended_at: null, status: 'active' },
  ];

  if (isLoading) return <div>Loading sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Meeting Sessions" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Session ID</th>
                <th className="px-4 py-3">Room ID</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess: ConferenceSession) => (
                <tr key={sess.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">{sess.id.split('-')[1]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{sess.room_id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {new Date(sess.started_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sess.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {sess.status}
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
