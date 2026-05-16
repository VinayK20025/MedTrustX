import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedpanda } from '../hooks/useRedpanda';
import type { StreamTopic } from '../types/redpanda.types';

export const StreamTopicsPanel: React.FC = () => {
  const { useTopics } = useRedpanda();
  const { data: response, isLoading } = useTopics();

  const topics = response?.data || [
    { id: 't-1', topic_name: 'clinical.vitals.stream', partitions: 12, replication_factor: 3 },
    { id: 't-2', topic_name: 'sys.audit.logs', partitions: 6, replication_factor: 3 },
    { id: 't-3', topic_name: 'iot.telemetry.raw', partitions: 24, replication_factor: 2 },
  ];

  if (isLoading) return <div>Loading stream topics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Stream Topics Registry" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((t: StreamTopic) => (
            <div key={t.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">RF: {t.replication_factor}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-200">{t.topic_name}</h3>
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{t.partitions} partitions</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
