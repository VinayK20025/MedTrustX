import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useLegalRiskAnalytics } from '../hooks/useLegalRiskAnalytics';
import type { RiskFactor } from '../types/legal-risk.types';

export const RiskFactorsPanel: React.FC = () => {
  const { useRiskFactors } = useLegalRiskAnalytics();
  const { data: response, isLoading } = useRiskFactors();

  const factors = response?.data || [
    { id: '1', case_id: 'CASE-2026-001', factor_name: 'missing_evidence', impact: 0.45 },
    { id: '2', case_id: 'CASE-2026-001', factor_name: 'late_filing', impact: 0.30 }
  ];

  if (isLoading) return <div>Loading risk factors...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Contributing Risk Factors" />
      <CardBody>
        <ul className="space-y-3">
          {factors.map((f: RiskFactor) => (
            <li key={f.id} className="flex justify-between items-center border-b border-white/10 pb-2">
              <div>
                <span className="text-sm font-medium capitalize">{f.factor_name.replace('_', ' ')}</span>
                <p className="text-xs text-gray-500">Case: {f.case_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${f.impact * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-300">{(f.impact * 100).toFixed(0)}%</span>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
