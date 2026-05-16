import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLegalRiskAnalytics } from '../hooks/useLegalRiskAnalytics';
import type { RiskScore } from '../types/legal-risk.types';

export const RiskScoresPanel: React.FC = () => {
  const { useRiskScores } = useLegalRiskAnalytics();
  const { data: response, isLoading } = useRiskScores();

  const scores = response?.data || [
    { id: '1', case_id: 'CASE-2026-001', risk_level: 'critical', score: 92.5 },
    { id: '2', case_id: 'CASE-2026-014', risk_level: 'medium', score: 45.2 }
  ];

  if (isLoading) return <div>Loading risk scores...</div>;

  const levelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Case Risk Scores" />
      <CardBody>
        <div className="space-y-4">
          {scores.map((sc: RiskScore) => (
            <div key={sc.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{sc.case_id}</p>
                <p className="text-xs text-gray-400 mt-1">Score: <span className="font-bold text-white">{sc.score.toFixed(1)}</span> / 100</p>
              </div>
              <Badge variant={levelColor(sc.risk_level)}>
                {sc.risk_level.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
