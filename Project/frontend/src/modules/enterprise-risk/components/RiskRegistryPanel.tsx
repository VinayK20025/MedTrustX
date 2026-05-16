import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRiskOversight } from '../hooks/useRiskOversight';
import type { Risk } from '../types/risk-oversight.types';

export const RiskRegistryPanel: React.FC = () => {
  const { useRisks } = useRiskOversight();
  const { data: response, isLoading } = useRisks();

  const risks = response?.data || [
    { id: '1', category: 'Operational', description: 'Supply chain disruption for critical meds', severity: 'critical', status: 'open' },
    { id: '2', category: 'Clinical', description: 'Surge in hospital-acquired infections', severity: 'high', status: 'mitigating' }
  ];

  if (isLoading) return <div>Loading risks...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Enterprise Risk Registry" />
      <CardBody>
        <div className="space-y-4">
          {risks.map((risk: Risk) => (
            <div key={risk.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">{risk.category.toUpperCase()}</Badge>
                <Badge variant={risk.severity === 'critical' ? 'danger' : 'warning'}>
                  {risk.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-200">{risk.description}</p>
              <div className="mt-3 text-xs text-gray-400">Status: {risk.status}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
