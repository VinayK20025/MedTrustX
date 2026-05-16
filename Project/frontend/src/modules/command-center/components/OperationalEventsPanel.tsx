import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCommandCenter } from '../hooks/useCommandCenter';
import type { OperationalEvent } from '../types/command-center.types';

export const OperationalEventsPanel: React.FC = () => {
  const { useEvents } = useCommandCenter();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: 'evt-1', event_type: 'Node_Eviction', source: 'k8s-cluster-1', payload: { node: 'worker-node-04', reason: 'OOM' } },
    { id: 'evt-2', event_type: 'BGP_Route_Flap', source: 'core-router-a', payload: { neighbor: '10.0.0.1', state: 'down' } }
  ];

  if (isLoading) return <div>Loading operational events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Cross-System Event Stream" />
      <CardBody>
        <div className="space-y-3">
          {events.map((evt: OperationalEvent) => (
            <div key={evt.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">{evt.source}</p>
                <p className="text-sm font-semibold capitalize text-gray-200">{evt.event_type.replace(/_/g, ' ')}</p>
              </div>
              <div className="bg-black/60 p-2 rounded text-[10px] text-gray-400 font-mono w-1/2 overflow-x-auto whitespace-pre-wrap text-right">
                {JSON.stringify(evt.payload)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
