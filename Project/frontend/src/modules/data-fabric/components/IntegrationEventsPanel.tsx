import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useDataFabric } from '../hooks/useDataFabric';
import type { IntegrationEvent } from '../types/data-fabric.types';

export const IntegrationEventsPanel: React.FC = () => {
  const { useEvents } = useDataFabric();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: '1', pipeline_id: 'Legacy EMR Ingestion', event_type: 'batch_started', payload: { records_expected: 5000, timestamp: new Date().toISOString() } },
    { id: '2', pipeline_id: 'Legacy EMR Ingestion', event_type: 'schema_mismatch_warning', payload: { field: 'middle_initial', error: 'type mismatch' } },
    { id: '3', pipeline_id: 'Patient Vitals Sync', event_type: 'connection_timeout', payload: { retry_count: 3 } }
  ];

  if (isLoading) return <div>Loading integration events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Fabric Telemetry Events" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {events.map((e: IntegrationEvent) => (
            <li key={e.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${e.event_type.includes('started') || e.event_type.includes('success') ? 'bg-emerald-500' : e.event_type.includes('warning') ? 'bg-amber-500' : 'bg-red-500'}`} />
              <p className="text-sm font-semibold capitalize text-gray-200">{e.event_type.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Pipeline: {e.pipeline_id}</p>
              <div className="text-[10px] text-gray-400 mt-2 font-mono bg-black/30 p-2 rounded break-words">
                {JSON.stringify(e.payload)}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
