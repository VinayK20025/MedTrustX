import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAiGovernance } from '../hooks/useAiGovernance';
import type { BiasMetric } from '../types/ai-governance.types';

export const BiasMetricsPanel: React.FC = () => {
  const { useBiasMetrics } = useAiGovernance();
  const { data: response, isLoading } = useBiasMetrics();

  const metrics = response?.data || [
    { id: '1', model_id: 'Readmission Risk Predictor', metric_name: 'disparate_impact_ratio', value: 0.92 },
    { id: '2', model_id: 'Readmission Risk Predictor', metric_name: 'statistical_parity_diff', value: 0.05 }
  ];

  if (isLoading) return <div>Loading bias metrics...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Fairness & Bias Monitoring" />
      <CardBody>
        <div className="space-y-3">
          {metrics.map((m: BiasMetric) => (
            <div key={m.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">{m.model_id}</p>
                <p className="text-sm font-semibold capitalize text-gray-200">{m.metric_name.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${m.value >= 0.8 && m.value <= 1.2 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.value.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
