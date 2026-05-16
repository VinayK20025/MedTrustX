import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useStrategicAnalytics } from '../hooks/useStrategicAnalytics';
import type { Forecast } from '../types/strategy.types';

export const ForecastPanel: React.FC = () => {
  const { useForecasts } = useStrategicAnalytics();
  const { data: response, isLoading } = useForecasts();

  const forecasts = response?.data || [
    { id: '1', metric_name: 'Patient Volume Q3', predicted_value: 12500 },
    { id: '2', metric_name: 'Revenue Margin (%)', predicted_value: 24.5 }
  ];

  if (isLoading) return <div>Loading forecasts...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Strategic Forecasts" />
      <CardBody>
        <div className="flex flex-col gap-3">
          {forecasts.map((fc: Forecast) => (
            <div key={fc.id} className="flex justify-between items-center border-b pb-2 last:border-0">
              <span className="text-gray-700 dark:text-gray-300">{fc.metric_name}</span>
              <span className="font-bold text-lg text-emerald-600">
                {fc.predicted_value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
