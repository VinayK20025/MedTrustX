import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import type { TwinSimulation } from '../types/digital-twin.types';

export const TwinSimulationsPanel: React.FC = () => {
  const { useSimulations } = useDigitalTwin();
  const { data: response, isLoading } = useSimulations();

  const simulations = response?.data || [
    { id: 'sim-88', twin_id: 'dt-2', simulation_type: 'stress_test', status: 'completed', started_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'sim-89', twin_id: 'dt-1', simulation_type: 'predictive', status: 'running', started_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading twin simulations...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'running': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'outline';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Digital Twin Predictive Modelling" />
      <CardBody>
        <div className="space-y-4">
          {simulations.map((sim: TwinSimulation) => (
            <div key={sim.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold capitalize text-gray-200">{sim.simulation_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-500 font-mono">[{sim.twin_id}]</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Started: {new Date(sim.started_at).toLocaleTimeString()}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="text-[10px] text-gray-500 font-mono">ID: {sim.id}</span>
                <Badge variant={statusVariant(sim.status)}>
                  {sim.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
