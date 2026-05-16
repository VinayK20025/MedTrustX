import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePostal } from '../hooks/usePostal';
import type { EmailQueue } from '../types/postal.types';

export const EmailQueuesPanel: React.FC = () => {
  const { useQueues } = usePostal();
  const { data: response, isLoading } = useQueues();

  const queues = response?.data || [
    { id: 'q-1', message_id: 'msg-4501', retry_count: 2, next_attempt: '2026-05-02T14:15:00Z' },
    { id: 'q-2', message_id: 'msg-4522', retry_count: 1, next_attempt: '2026-05-02T14:05:00Z' },
    { id: 'q-3', message_id: 'msg-4899', retry_count: 4, next_attempt: '2026-05-02T15:30:00Z' },
  ];

  if (isLoading) return <div>Loading queues...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Retry Queues" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Message ID</th>
                <th className="px-4 py-3 text-center">Retries</th>
                <th className="px-4 py-3 rounded-r-lg">Next Attempt</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q: EmailQueue) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{q.message_id}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.retry_count > 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {q.retry_count}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {new Date(q.next_attempt).toLocaleTimeString()}
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
