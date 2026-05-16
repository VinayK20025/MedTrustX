import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCCTVSurveillance } from '../hooks/useCCTVSurveillance';
import type { Camera } from '../types/cctv-surveillance.types';

export const CamerasPanel: React.FC = () => {
  const { useCameras } = useCCTVSurveillance();
  const { data: response, isLoading } = useCameras();

  const cameras = response?.data || [
    { id: '1', name: 'CAM-LOBBY-01', location: 'Main Lobby Entrance', status: 'online' },
    { id: '2', name: 'CAM-ICU-03', location: 'ICU Corridor West', status: 'online' },
    { id: '3', name: 'CAM-PARK-07', location: 'Parking Level B2', status: 'offline' },
    { id: '4', name: 'CAM-OR-02', location: 'Operating Room 2', status: 'maintenance' }
  ];

  if (isLoading) return <div>Loading cameras...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Camera Fleet" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((cam: Camera) => (
            <div key={cam.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-mono font-bold text-blue-400">{cam.name}</span>
                <Badge variant={statusVariant(cam.status)}>
                  {cam.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">📍 {cam.location}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
