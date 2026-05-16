import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedis } from '../hooks/useRedis';
import type { SessionStore } from '../types/redis.types';

export const SessionStorePanel: React.FC = () => {
  const { useSessions } = useRedis();
  const { data: response, isLoading } = useSessions();

  const sessions = response?.data || [
    { id: 'ss-1', session_id: 'sess_abc123xyz890', data: { user_id: 'u-101', role: 'admin', ip: '10.0.1.5' }, expires_at: '2026-05-02T16:00:00Z' },
    { id: 'ss-2', session_id: 'sess_def456uvw123', data: { user_id: 'u-205', role: 'doctor', ip: '10.0.4.12' }, expires_at: '2026-05-02T14:30:00Z' },
    { id: 'ss-3', session_id: 'sess_ghi789rst456', data: { user_id: 'u-310', role: 'nurse', ip: '10.0.4.55' }, expires_at: '2026-05-02T18:00:00Z' },
  ];

  if (isLoading) return <div>Loading active sessions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Active Sessions" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Session ID</th>
                <th className="px-4 py-3">User Role</th>
                <th className="px-4 py-3">Client IP</th>
                <th className="px-4 py-3 rounded-r-lg">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((ss: SessionStore) => (
                <tr key={ss.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">{ss.session_id.slice(0, 12)}...</td>
                  <td className="px-4 py-3 font-semibold text-gray-200 capitalize">{ss.data.role}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{ss.data.ip}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {ss.expires_at ? new Date(ss.expires_at).toLocaleTimeString() : 'N/A'}
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
