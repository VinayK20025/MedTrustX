import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useIot } from '../hooks/useIot';
import type { DeviceEvent } from '../types/iot.types';

export const EventsPanel: React.FC = () => {
  const { useEvents } = useIot();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: 'evt-1', device_id: 'dev-ventilator-9C', event_type: 'firmware_updated', payload: { old_v: '1.2.0', new_v: '1.2.1' } },
    { id: 'evt-2', device_id: 'dev-hvac-roof', event_type: 'alert_triggered', payload: { code: 'ERR_FILTER_CLOGGED' } },
  ];

  if (isLoading) return <div>Loading events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Lifecycle Events" />
      <CardBody>
        <div className="space-y-3">
          {events.map((evt: DeviceEvent) => (
            <div key={evt.id} className="p-3 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-gray-200">{evt.device_id}</span>
                <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded uppercase">{evt.event_type}</span>
              </div>
              <pre className="text-[10px] text-gray-400 font-mono bg-black/40 p-2 rounded m-0">
                {JSON.stringify(evt.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
