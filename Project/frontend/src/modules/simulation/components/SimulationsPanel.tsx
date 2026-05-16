import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSimulation } from '../hooks/useSimulation';
import type { Simulation } from '../types/simulation.types';

export const SimulationsPanel: React.FC = () => {
  const { useSimulations } = useSimulation();
  const { data: response, isLoading } = useSimulations();

  const simulations = response?.data || [
    { id: 'sim-1', name: 'Winter Flu Surge + Bed Shortage', type: 'stress_test', status: 'running' },
    { id: 'sim-2', name: 'New Ward Staffing Policy', type: 'policy_impact', status: 'completed' },
    { id: 'sim-3', name: 'ER Divert Scenario', type: 'what_if', status: 'pending' }
  ];

  if (isLoading) return <div>Loading simulations...</div>;

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
      <CardHeader title="Simulation Engine Runs" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {simulations.map((sim: Simulation) => (
            <div key={sim.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 mb-1">{sim.name}</h3>
                <p className="text-xs text-blue-400 capitalize mb-4">{sim.type.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Badge variant={statusVariant(sim.status)}>
                  {sim.status.toUpperCase()}
                </Badge>
                <span className="text-[10px] text-gray-500 font-mono">ID: {sim.id.split('-')[1]}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
