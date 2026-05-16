import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useStrategicAnalytics } from '../hooks/useStrategicAnalytics';
import type { Objective } from '../types/strategy.types';

export const ObjectivesList: React.FC = () => {
  const { useObjectives } = useStrategicAnalytics();
  const { data: response, isLoading } = useObjectives();

  const objectives = response?.data || [
    { id: '1', objective_name: 'Reduce patient wait time by 15%', target_value: 15 },
    { id: '2', objective_name: 'Achieve Zero Harm in ICU', target_value: 100 }
  ];

  if (isLoading) return <div>Loading objectives...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Strategic Objectives" />
      <CardBody>
        <ul className="space-y-3">
          {objectives.map((obj: Objective) => (
            <li key={obj.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{obj.objective_name}</span>
              <span className="text-sm text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                Target: {obj.target_value}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
