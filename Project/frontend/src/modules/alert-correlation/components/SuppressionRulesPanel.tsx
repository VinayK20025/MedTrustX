import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAlertCorrelation } from '../hooks/useAlertCorrelation';
import type { SuppressionRule } from '../types/alert-correlation.types';

export const SuppressionRulesPanel: React.FC = () => {
  const { useRules } = useAlertCorrelation();
  const { data: response, isLoading } = useRules();

  const rules = response?.data || [
    { id: '1', rule_name: 'Ignore Nightly Backup Latency', conditions: { type: 'latency_spike', time_window: '02:00-04:00' } },
    { id: '2', rule_name: 'Deduplicate CPU Spikes', conditions: { type: 'cpu_high', throttle: '5m' } }
  ];

  if (isLoading) return <div>Loading suppression rules...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Suppression & Deduplication Rules" />
      <CardBody>
        <div className="space-y-4">
          {rules.map((r: SuppressionRule) => (
            <div key={r.id} className="p-4 border-l-4 border-l-gray-500 rounded bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-blue-400 mb-2">{r.rule_name}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(r.conditions).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[10px] bg-black/40 px-2 py-1 rounded">
                    <span className="text-gray-400 font-mono capitalize mr-2">{k.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-200 font-mono">{String(v)}</span>
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
