import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSimulation } from '../hooks/useSimulation';
import type { SimulationEvent } from '../types/simulation.types';

export const SimulationEventsPanel: React.FC = () => {
  const { useEvents } = useSimulation();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: 'evt-1', simulation_id: 'sim-1', event_type: 'capacity_breach', payload: { unit: 'ICU', time_index: 't+14h' } },
    { id: 'evt-2', simulation_id: 'sim-1', event_type: 'resource_exhaustion', payload: { resource: 'Ventilators', time_index: 't+18h' } }
  ];

  if (isLoading) return <div>Loading simulation events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Timeline Lifecycle Events" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {events.map((evt: SimulationEvent) => (
            <li key={evt.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500" />
              <p className="text-sm font-semibold capitalize text-gray-200">{evt.event_type.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Sim: {evt.simulation_id}</p>
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
