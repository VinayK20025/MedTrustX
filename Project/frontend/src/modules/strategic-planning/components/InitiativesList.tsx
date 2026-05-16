import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStrategicAnalytics } from '../hooks/useStrategicAnalytics';
import type { Initiative } from '../types/strategy.types';

export const InitiativesList: React.FC = () => {
  const { useInitiatives } = useStrategicAnalytics();
  const { data: response, isLoading } = useInitiatives();

  const initiatives = response?.data || [
    { id: '1', initiative_name: 'AI Triage Implementation', status: 'in_progress' },
    { id: '2', initiative_name: 'Robotic Surgery Program', status: 'planned' }
  ];

  if (isLoading) return <div>Loading initiatives...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Execution Initiatives" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initiatives.map((init: Initiative) => (
            <div key={init.id} className="p-4 border rounded-md shadow-sm">
              <h4 className="font-semibold text-sm mb-2">{init.initiative_name}</h4>
              <Badge variant={init.status === 'in_progress' ? 'warning' : 'outline'}>
                {init.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
