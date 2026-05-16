import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSimulation } from '../hooks/useSimulation';
import type { SimulationResult } from '../types/simulation.types';

export const SimulationResultsPanel: React.FC = () => {
  const { useResults } = useSimulation();
  const { data: response, isLoading } = useResults();

  const results = response?.data || [
    { id: 'res-1', simulation_id: 'sim-2', generated_at: new Date().toISOString(), result: { predicted_wait_time_increase: '45 mins', burn_out_risk_score: 0.82, cost_savings_annual: '$1.2M' } }
  ];

  if (isLoading) return <div>Loading simulation results...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Computed Simulation Outcomes" />
      <CardBody>
        <div className="space-y-4">
          {results.map((res: SimulationResult) => (
            <div key={res.id} className="p-4 border border-emerald-500/30 rounded-lg bg-emerald-500/5">
              <div className="flex justify-between mb-4 border-b border-white/10 pb-2">
                <span className="text-sm font-semibold text-emerald-400">Outcome for {res.simulation_id}</span>
                <span className="text-xs text-gray-500 font-mono">{new Date(res.generated_at).toLocaleTimeString()}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(res.result).map(([k, v]) => (
                  <div key={k} className="bg-black/40 p-2 rounded flex justify-between items-center">
                    <span className="text-xs text-gray-400 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold text-gray-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
