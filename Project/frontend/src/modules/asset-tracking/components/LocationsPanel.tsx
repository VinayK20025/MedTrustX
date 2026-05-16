import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAssetTracking } from '../hooks/useAssetTracking';
import type { Location } from '../types/asset-tracking.types';

export const LocationsPanel: React.FC = () => {
  const { useLocations } = useAssetTracking();
  const { data: response, isLoading } = useLocations();

  const locations = response?.data || [
    { id: '1', asset_id: '1', zone: 'Ward 3B - Bay 2', coordinates: { x: 12.4, y: 8.7, floor: 3 }, timestamp: new Date().toISOString() },
    { id: '2', asset_id: '2', zone: 'ICU - Bed 5', coordinates: { x: 5.1, y: 3.2, floor: 2 }, timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading locations...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Real-Time Locations" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc: Location) => (
            <div key={loc.id} className="p-4 bg-white/5 rounded-md border border-white/10">
              <p className="text-sm font-semibold text-emerald-400 mb-2">📍 {loc.zone}</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <p className="text-gray-500">X</p>
                  <p className="font-bold text-white">{loc.coordinates.x}</p>
                </div>
                <div>
                  <p className="text-gray-500">Y</p>
                  <p className="font-bold text-white">{loc.coordinates.y}</p>
                </div>
                <div>
                  <p className="text-gray-500">Floor</p>
                  <p className="font-bold text-white">{loc.coordinates.floor}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{new Date(loc.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
