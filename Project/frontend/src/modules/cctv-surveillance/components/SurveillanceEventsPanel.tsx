import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCCTVSurveillance } from '../hooks/useCCTVSurveillance';
import type { SurveillanceEvent } from '../types/cctv-surveillance.types';

export const SurveillanceEventsPanel: React.FC = () => {
  const { useEvents } = useCCTVSurveillance();
  const { data: response, isLoading } = useEvents();

  const events = response?.data || [
    { id: '1', camera_id: 'CAM-PARK-07', event_type: 'motion', metadata_json: { confidence: 0.92, region: 'zone-b2-south' } },
    { id: '2', camera_id: 'CAM-LOBBY-01', event_type: 'intrusion', metadata_json: { confidence: 0.87, description: 'Unauthorized access attempt' } }
  ];

  if (isLoading) return <div>Loading surveillance events...</div>;

  const eventVariant = (t: string) => {
    switch (t) {
      case 'intrusion': return 'danger';
      case 'motion': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="AI Detection Events" />
      <CardBody>
        <div className="space-y-4">
          {events.map((e: SurveillanceEvent) => (
            <div key={e.id} className="p-4 border border-white/10 rounded-lg bg-white/5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{e.event_type} Detected</p>
                  <p className="text-xs text-gray-500 mt-1">Camera: {e.camera_id}</p>
                </div>
                <Badge variant={eventVariant(e.event_type)}>
                  {e.event_type.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {Object.entries(e.metadata_json).map(([k, v]) => (
                  <span key={k} className="mr-3">
                    <span className="text-gray-500 capitalize">{k}:</span>{' '}
                    <span className="text-white font-medium">{String(v)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
