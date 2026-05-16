import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSimulation } from '../hooks/useSimulation';
import type { Scenario } from '../types/simulation.types';

export const ScenariosPanel: React.FC = () => {
  const { useScenarios } = useSimulation();
  const { data: response, isLoading } = useScenarios();

  const scenarios = response?.data || [
    { id: 'scen-1a', simulation_id: 'sim-1', parameters: { admission_rate_multiplier: 1.5, icu_capacity: 0.95 } },
    { id: 'scen-1b', simulation_id: 'sim-1', parameters: { admission_rate_multiplier: 2.0, icu_capacity: 1.0 } },
    { id: 'scen-2a', simulation_id: 'sim-2', parameters: { nurse_to_patient_ratio: '1:5' } }
  ];

  if (isLoading) return <div>Loading scenarios...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Scenario Branch Parameters" />
      <CardBody>
        <div className="space-y-4">
          {scenarios.map((scen: Scenario) => (
            <div key={scen.id} className="p-3 border border-white/10 rounded-lg bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="pl-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-200">{scen.id}</span>
                  <span className="text-xs text-gray-500 font-mono">Sim: {scen.simulation_id}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(scen.parameters).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-[10px] bg-black/40 px-2 py-1 rounded">
                      <span className="text-gray-400 capitalize mr-2">{k.replace(/_/g, ' ')}:</span>
                      <span className="text-emerald-400 font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
