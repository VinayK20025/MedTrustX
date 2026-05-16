import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAssetTracking } from '../hooks/useAssetTracking';
import type { MovementEvent } from '../types/asset-tracking.types';

export const MovementEventsPanel: React.FC = () => {
  const { useMovements } = useAssetTracking();
  const { data: response, isLoading } = useMovements();

  const movements = response?.data || [
    { id: '1', asset_id: '1', from_zone: 'Ward 3B - Bay 2', to_zone: 'Radiology - Room 1' },
    { id: '2', asset_id: '2', from_zone: 'Pharmacy Store', to_zone: 'ICU - Bed 5' }
  ];

  if (isLoading) return <div>Loading movement events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Zone Transition Log" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {movements.map((m: MovementEvent) => (
            <li key={m.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-xs text-gray-500 mb-1">Asset: {m.asset_id}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400">{m.from_zone}</span>
                <span className="text-gray-500">&rarr;</span>
                <span className="text-emerald-400">{m.to_zone}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
