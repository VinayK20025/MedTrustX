import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePerformanceIntelligence } from '../hooks/usePerformanceIntelligence';
import type { PerformanceScore } from '../types/performance-intelligence.types';

export const PerformanceScoresPanel: React.FC = () => {
  const { useScores } = usePerformanceIntelligence();
  const { data: response, isLoading } = useScores();

  const scores = response?.data || [
    { id: '1', service_name: 'clinical-service', score: 0.95, evaluated_at: new Date().toISOString() },
    { id: '2', service_name: 'billing-service', score: 0.78, evaluated_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading scores...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Health Scores" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scores.map((sc: PerformanceScore) => (
            <div key={sc.id} className="p-4 bg-white/5 rounded-md border border-white/10">
              <p className="text-sm font-semibold">{sc.service_name}</p>
              <p className="text-xs text-gray-400 mt-1">Composite Score</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${sc.score > 0.9 ? 'bg-emerald-500' : sc.score > 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${sc.score * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{(sc.score * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
