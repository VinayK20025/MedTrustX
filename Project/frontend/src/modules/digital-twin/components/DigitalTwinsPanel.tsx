import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import type { DigitalTwin } from '../types/digital-twin.types';

export const DigitalTwinsPanel: React.FC = () => {
  const { useTwins } = useDigitalTwin();
  const { data: response, isLoading } = useTwins();

  const twins = response?.data || [
    { id: 'dt-1', entity_id: 'Phys-Vent-004', type: 'ventilator', state: { flow_rate: '45 L/min', pressure: '12 cmH2O', mode: 'SIMV' } },
    { id: 'dt-2', entity_id: 'Fac-HVAC-North', type: 'facility_hvac', state: { temp: '21C', humidity: '45%', hepa_filter_status: 'good' } }
  ];

  if (isLoading) return <div>Loading digital twins...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Active Digital Twin Replicas" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {twins.map((t: DigitalTwin) => (
            <div key={t.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-bold text-blue-400">{t.entity_id}</h3>
                  <span className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">{t.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold animate-pulse">
                  SYNCED
                </div>
              </div>
              <div className="bg-black/40 p-2 rounded flex flex-wrap gap-2">
                {Object.entries(t.state).map(([k, v]) => (
                  <div key={k} className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5">
                    <span className="text-gray-400 mr-2 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-200 font-mono">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
