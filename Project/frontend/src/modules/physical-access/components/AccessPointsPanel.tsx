import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePhysicalAccess } from '../hooks/usePhysicalAccess';
import type { AccessPoint } from '../types/physical-access.types';

export const AccessPointsPanel: React.FC = () => {
  const { usePoints } = usePhysicalAccess();
  const { data: response, isLoading } = usePoints();

  const points = response?.data || [
    { id: '1', name: 'Main Lobby Turnstile 1', location: 'Ground Floor East', status: 'online' },
    { id: '2', name: 'ICU Ward Door', location: 'Level 3 North', status: 'online' },
    { id: '3', name: 'Pharmacy Vault', location: 'Level 2 Secure', status: 'locked_down' },
    { id: '4', name: 'Staff Entrance Gate', location: 'Parking Level 1', status: 'maintenance' }
  ];

  if (isLoading) return <div>Loading access points...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'online': return 'success';
      case 'locked_down': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Access Points Registry" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {points.map((ap: AccessPoint) => (
            <div key={ap.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-200">{ap.name}</span>
                <Badge variant={statusVariant(ap.status)}>
                  {ap.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">📍 {ap.location}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
