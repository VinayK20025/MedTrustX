import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePerformanceIntelligence } from '../hooks/usePerformanceIntelligence';
import type { OptimizationInsight } from '../types/performance-intelligence.types';

export const OptimizationInsightsPanel: React.FC = () => {
  const { useInsights } = usePerformanceIntelligence();
  const { data: response, isLoading } = useInsights();

  const insights = response?.data || [
    { id: '1', service_name: 'billing-service', insight: 'Implement Redis caching to reduce DB load', impact: 0.35 },
    { id: '2', service_name: 'clinical-service', insight: 'Optimize database indexes on patients table', impact: 0.15 }
  ];

  if (isLoading) return <div>Loading insights...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Optimization Insights" />
      <CardBody>
        <div className="space-y-3">
          {insights.map((insight: OptimizationInsight) => (
            <div key={insight.id} className="flex flex-col p-3 rounded bg-white/5 border border-white/10 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-200">{insight.service_name}</span>
                <Badge variant="outline">
                  +{(insight.impact * 100).toFixed(0)}% Impact
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{insight.insight}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
