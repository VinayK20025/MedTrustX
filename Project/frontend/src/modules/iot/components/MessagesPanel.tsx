import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useIot } from '../hooks/useIot';
import type { MessageLog } from '../types/iot.types';

export const MessagesPanel: React.FC = () => {
  const { useMessages } = useIot();
  const { data: response, isLoading } = useMessages();

  const messages = response?.data || [
    { id: 'msg-1', device_id: 'dev-infusion-1A', topic: 'medtrustx/icu/vitals', payload: { rate: 50, vol: 100 }, received_at: '2026-05-02T14:10:05Z' },
    { id: 'msg-2', device_id: 'dev-hvac-roof', topic: 'medtrustx/facilities/hvac', payload: { temp_c: 22.4, fan_speed: 80 }, received_at: '2026-05-02T14:10:10Z' },
  ];

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Telemetry Stream" />
      <CardBody>
        <div className="space-y-3">
          {messages.map((msg: MessageLog) => (
            <div key={msg.id} className="p-3 border border-white/10 rounded-lg bg-[#0d1117] font-mono text-xs overflow-x-auto">
              <div className="flex gap-4 mb-2 border-b border-white/10 pb-2">
                <span className="text-purple-400">device: <span className="text-gray-300">{msg.device_id}</span></span>
                <span className="text-blue-400">topic: <span className="text-gray-300">{msg.topic}</span></span>
              </div>
              <pre className="text-gray-400 m-0 p-0 bg-transparent">
                {JSON.stringify(msg.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
