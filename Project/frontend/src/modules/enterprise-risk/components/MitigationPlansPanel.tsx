import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRiskOversight } from '../hooks/useRiskOversight';
import type { MitigationPlan } from '../types/risk-oversight.types';

export const MitigationPlansPanel: React.FC = () => {
  const { useMitigationPlans } = useRiskOversight();
  const { data: response, isLoading } = useMitigationPlans();

  const plans = response?.data || [
    { id: '1', risk_id: '1', status: 'in_progress', actions: { step1: 'Vendor diversification' } },
    { id: '2', risk_id: '2', status: 'pending', actions: { step1: 'Protocol audit' } }
  ];

  if (isLoading) return <div>Loading mitigation plans...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Mitigation Plans" />
      <CardBody>
        <div className="space-y-3">
          {plans.map((plan: MitigationPlan) => (
            <div key={plan.id} className="p-3 bg-white/5 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Plan ID: {plan.id.slice(0, 8)}</span>
                <Badge variant="outline">{plan.status.toUpperCase()}</Badge>
              </div>
              <div className="text-xs text-gray-400">
                {Object.values(plan.actions).map((act: any, i: number) => (
                  <p key={i}>- {act}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
