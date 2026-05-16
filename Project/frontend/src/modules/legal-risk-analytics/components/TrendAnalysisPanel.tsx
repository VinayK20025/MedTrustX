import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useLegalRiskAnalytics } from '../hooks/useLegalRiskAnalytics';
import type { TrendAnalysis } from '../types/legal-risk.types';

export const TrendAnalysisPanel: React.FC = () => {
  const { useTrends } = useLegalRiskAnalytics();
  const { data: response, isLoading } = useTrends();

  const trends = response?.data || [
    { id: '1', category: 'malpractice_claims', metrics: { q1: 12, q2: 9, q3: 15, q4: 7 } },
    { id: '2', category: 'data_breaches', metrics: { q1: 3, q2: 1, q3: 2, q4: 0 } }
  ];

  if (isLoading) return <div>Loading trends...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Historical Trend Analysis" />
      <CardBody>
        <div className="space-y-4">
          {trends.map((trend: TrendAnalysis) => (
            <div key={trend.id} className="p-4 bg-white/5 rounded-md border border-white/10">
              <p className="text-sm font-semibold capitalize mb-2">{trend.category.replace('_', ' ')}</p>
              <div className="flex gap-3">
                {Object.entries(trend.metrics).map(([period, val]) => (
                  <div key={period} className="flex-1 text-center p-2 bg-white/5 rounded">
                    <p className="text-xs text-gray-500 uppercase">{period}</p>
                    <p className="text-lg font-bold text-teal-400">{val as number}</p>
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
