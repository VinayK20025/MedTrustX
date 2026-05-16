import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStrategicAnalytics } from '../hooks/useStrategicAnalytics';
import type { StrategicPlan } from '../types/strategy.types';

export const StrategicPlanList: React.FC = () => {
  const { usePlans } = useStrategicAnalytics();
  const { data: response, isLoading } = usePlans();
  
  // Provide mock data if no data available, as requested
  const plans = response?.data || [
    { id: '1', name: 'Vision 2030 Transformation', horizon: 'FY2030', status: 'active' },
    { id: '2', name: 'Digital Hospital Expansion', horizon: 'Q4_2026', status: 'draft' }
  ];

  if (isLoading) return <div>Loading plans...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Master Strategic Plans" />
      <CardBody>
        <div className="space-y-4">
          {plans.map((plan: StrategicPlan) => (
            <div key={plan.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</p>
                <p className="text-sm text-gray-500">Horizon: {plan.horizon}</p>
              </div>
              <Badge variant={plan.status === 'active' ? 'success' : 'outline'}>
                {plan.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
