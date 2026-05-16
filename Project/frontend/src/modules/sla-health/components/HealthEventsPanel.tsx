import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSlaHealth } from '../hooks/useSlaHealth';
import type { HealthEvent } from '../types/sla-health.types';

export const HealthEventsPanel: React.FC = () => {
  const { useEvents } = useSlaHealth();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: '1', service_name: 'Patient Record Service', event_type: 'health_check_ok', payload: { ping_ms: 45, db_status: 'connected' } },
    { id: '2', service_name: 'Radiology Imaging API', event_type: 'timeout', payload: { endpoint: '/v1/images', duration_ms: 5002 } }
  ];

  if (isLoading) return <div>Loading health events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Raw Telemetry Events" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {events.map((e: HealthEvent) => (
            <li key={e.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${e.event_type.includes('ok') ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <p className="text-sm font-semibold capitalize text-gray-200">{e.service_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 capitalize">{e.event_type.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-mono bg-black/30 p-2 rounded">
                {JSON.stringify(e.payload)}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
