import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedpanda } from '../hooks/useRedpanda';
import type { ConsumerOffset } from '../types/redpanda.types';

export const ConsumerOffsetsPanel: React.FC = () => {
  const { useConsumerOffsets } = useRedpanda();
  const { data: response, isLoading } = useConsumerOffsets();

  const offsets = response?.data || [
    { id: 'co-1', consumer_group: 'clinical-analytics-engine', topic: 'clinical.vitals.stream', partition: 3, offset: 104251 },
    { id: 'co-2', consumer_group: 'audit-archiver-svc', topic: 'sys.audit.logs', partition: 1, offset: 8850 },
    { id: 'co-3', consumer_group: 'iot-anomaly-detector', topic: 'iot.telemetry.raw', partition: 18, offset: 5092000 },
  ];

  if (isLoading) return <div>Loading consumer offsets...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Consumer Group Offsets" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Consumer Group</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Partition</th>
                <th className="px-4 py-3 rounded-r-lg">Committed Offset</th>
              </tr>
            </thead>
            <tbody>
              {offsets.map((co: ConsumerOffset) => (
                <tr key={co.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-200">{co.consumer_group}</td>
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">{co.topic}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{co.partition}</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">{co.offset.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};
