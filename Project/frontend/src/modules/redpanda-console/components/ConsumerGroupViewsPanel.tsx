import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedpandaConsole } from '../hooks/useRedpandaConsole';
import type { ConsumerGroupView } from '../types/redpanda-console.types';

export const ConsumerGroupViewsPanel: React.FC = () => {
  const { useConsumerGroups } = useRedpandaConsole();
  const { data: response, isLoading } = useConsumerGroups();

  const groups = response?.data || [
    { id: '1', group_name: 'vitals-aggregator-cg', lag: 15420, checked_at: new Date().toISOString() },
    { id: '2', group_name: 'audit-indexer-cg', lag: 0, checked_at: new Date(Date.now() - 300000).toISOString() }
  ];

  if (isLoading) return <div>Loading consumer groups...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Consumer Group Lag Audits" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {groups.map((cg: ConsumerGroupView) => (
            <div key={cg.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center relative overflow-hidden">
              <div className={`absolute left-0 top-0 h-full w-1 ${cg.lag > 10000 ? 'bg-red-500' : cg.lag > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <div className="pl-3">
                <h3 className="text-sm font-bold text-gray-200 font-mono mb-1">{cg.group_name}</h3>
                <span className="text-[10px] text-gray-500 font-mono">Checked: {new Date(cg.checked_at).toLocaleTimeString()}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block mb-1">Lag Offset</span>
                <span className={`text-lg font-bold font-mono ${cg.lag > 10000 ? 'text-red-400' : cg.lag > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {cg.lag.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
