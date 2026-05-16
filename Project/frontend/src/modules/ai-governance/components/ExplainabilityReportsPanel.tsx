import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAiGovernance } from '../hooks/useAiGovernance';
import type { ExplainabilityReport } from '../types/ai-governance.types';

export const ExplainabilityReportsPanel: React.FC = () => {
  const { useReports } = useAiGovernance();
  const { data: response, isLoading } = useReports();

  const reports = response?.data || [
    { id: '1', model_id: 'Clinical Pathway Recommender', explanation: { feature_importance: { age: 0.45, bp_systolic: 0.3, family_history: 0.25 }, method: 'SHAP' } }
  ];

  if (isLoading) return <div>Loading explainability reports...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="SHAP/LIME Explainability" />
      <CardBody>
        <div className="space-y-4">
          {reports.map((r: ExplainabilityReport) => (
            <div key={r.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <p className="text-sm font-semibold text-gray-200 mb-2">Model: {r.model_id}</p>
              <div className="text-[11px] font-mono text-gray-400 bg-black/40 p-3 rounded">
                <p className="text-blue-400 mb-2">Method: {r.explanation.method}</p>
                {r.explanation.feature_importance && Object.entries(r.explanation.feature_importance).map(([feature, weight]) => (
                  <div key={feature} className="flex items-center gap-2 mt-1">
                    <span className="w-24 truncate">{feature}</span>
                    <div className="flex-1 bg-gray-700 h-1.5 rounded-full">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Number(weight) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right">{(Number(weight) * 100).toFixed(0)}%</span>
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
