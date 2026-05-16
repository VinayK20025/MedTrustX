import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import type { TwinState } from '../types/digital-twin.types';

export const TwinStatesPanel: React.FC = () => {
  const { useStates } = useDigitalTwin();
  const { data: response, isLoading } = useStates();

  const states = response?.data || [
    { id: 'ts-991', twin_id: 'dt-1', state: { flow_rate: '45 L/min', pressure: '12 cmH2O', mode: 'SIMV' } },
    { id: 'ts-990', twin_id: 'dt-1', state: { flow_rate: '40 L/min', pressure: '10 cmH2O', mode: 'CPAP' } }
  ];

  if (isLoading) return <div>Loading state snapshots...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Historical State Snapshots" />
      <CardBody>
        <div className="space-y-3">
          {states.map((ts: TwinState) => (
            <div key={ts.id} className="p-3 border border-white/10 rounded bg-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="min-w-[120px]">
                <p className="text-sm font-semibold text-gray-200">{ts.id}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Twin: {ts.twin_id}</p>
              </div>
              <div className="flex-1 bg-black/60 p-2 rounded text-[10px] text-gray-400 font-mono w-full overflow-x-auto whitespace-nowrap">
                {JSON.stringify(ts.state)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
