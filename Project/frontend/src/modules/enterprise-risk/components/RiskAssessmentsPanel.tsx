import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRiskOversight } from '../hooks/useRiskOversight';
import type { RiskAssessment } from '../types/risk-oversight.types';

export const RiskAssessmentsPanel: React.FC = () => {
  const { useAssessments } = useRiskOversight();
  const { data: response, isLoading } = useAssessments();

  const assessments = response?.data || [
    { id: '1', risk_id: '1', score: 85, likelihood: 4.5, impact: 5.0, assessed_at: new Date().toISOString() },
    { id: '2', risk_id: '2', score: 60, likelihood: 3.0, impact: 4.0, assessed_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading assessments...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Quantitative Assessments" />
      <CardBody>
        <ul className="space-y-3">
          {assessments.map((a: RiskAssessment) => (
            <li key={a.id} className="flex flex-col gap-1 border-b border-white/10 pb-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Risk Score</span>
                <span className={`font-bold ${a.score > 75 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {a.score} / 100
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Likelihood: {a.likelihood}</span>
                <span>Impact: {a.impact}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
