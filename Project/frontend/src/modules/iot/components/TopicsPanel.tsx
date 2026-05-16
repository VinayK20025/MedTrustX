import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useIot } from '../hooks/useIot';
import type { MqttTopic } from '../types/iot.types';

export const TopicsPanel: React.FC = () => {
  const { useTopics } = useIot();
  const { data: response, isLoading } = useTopics();

  const topics = response?.data || [
    { id: 'top-1', topic: 'medtrustx/icu/vitals/+', qos: 1 },
    { id: 'top-2', topic: 'medtrustx/er/alerts', qos: 2 },
    { id: 'top-3', topic: 'medtrustx/facilities/hvac/telemetry', qos: 0 },
  ];

  if (isLoading) return <div>Loading topics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="MQTT Routing Topics" />
      <CardBody>
        <div className="space-y-3">
          {topics.map((top: MqttTopic) => (
            <div key={top.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex items-center justify-between">
              <span className="font-mono text-xs text-blue-400">{top.topic}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                top.qos === 2 ? 'bg-purple-500/20 text-purple-400' : 
                top.qos === 1 ? 'bg-amber-500/20 text-amber-400' : 
                'bg-gray-500/20 text-gray-400'
              }`}>
                QoS {top.qos}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
