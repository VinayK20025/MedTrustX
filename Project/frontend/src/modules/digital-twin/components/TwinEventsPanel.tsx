import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import type { TwinEvent } from '../types/digital-twin.types';

export const TwinEventsPanel: React.FC = () => {
  const { useEvents } = useDigitalTwin();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: 'evt-1', twin_id: 'dt-1', event_type: 'mode_change', payload: { previous: 'CPAP', current: 'SIMV', operator: 'RT-Smith' } },
    { id: 'evt-2', twin_id: 'dt-2', event_type: 'filter_warning', payload: { sensor_reading: 'pressure_drop', threshold: 'exceeded' } }
  ];

  if (isLoading) return <div>Loading twin events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Twin Lifecycle Events" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {events.map((evt: TwinEvent) => (
            <li key={evt.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-sm font-semibold capitalize text-gray-200">{evt.event_type.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Twin: {evt.twin_id}</p>
              <div className="bg-black/30 p-2 mt-2 rounded text-[10px] text-gray-400 font-mono w-full break-words">
                {JSON.stringify(evt.payload)}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
