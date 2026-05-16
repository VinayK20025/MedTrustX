import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedpanda } from '../hooks/useRedpanda';
import type { StreamMessage } from '../types/redpanda.types';

export const StreamMessagesPanel: React.FC = () => {
  const { useMessages } = useRedpanda();
  const { data: response, isLoading } = useMessages();

  const messages = response?.data || [
    { id: 'm-1', topic: 'clinical.vitals.stream', key: 'pt-12345', value: { hr: 72, bp: '120/80', spO2: 98 }, partition: 3, offset: 104251 },
    { id: 'm-2', topic: 'sys.audit.logs', key: null, value: { action: 'USER_LOGIN', user_id: 'u-889', ip: '10.0.4.15' }, partition: 1, offset: 8852 },
    { id: 'm-3', topic: 'iot.telemetry.raw', key: 'dev-infusion-pump-A4', value: { status: 'active', rate_ml_hr: 50, battery_pct: 88 }, partition: 18, offset: 5092113 },
  ];

  if (isLoading) return <div>Loading stream messages...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Live Message Stream Viewer" />
      <CardBody>
        <div className="space-y-3">
          {messages.map((m: StreamMessage) => (
            <div key={m.id} className="p-3 border border-white/10 rounded-lg bg-[#0d1117] font-mono text-xs overflow-x-auto">
              <div className="flex gap-4 mb-2 border-b border-white/10 pb-2">
                <span className="text-purple-400">topic: <span className="text-gray-300">{m.topic}</span></span>
                <span className="text-blue-400">part: <span className="text-gray-300">{m.partition}</span></span>
                <span className="text-emerald-400">offset: <span className="text-gray-300">{m.offset}</span></span>
                {m.key && <span className="text-amber-400">key: <span className="text-gray-300">{m.key}</span></span>}
              </div>
              <pre className="text-gray-400 m-0 p-0 bg-transparent">
                {JSON.stringify(m.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
