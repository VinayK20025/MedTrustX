import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAiGovernance } from '../hooks/useAiGovernance';
import type { ModelDecision } from '../types/ai-governance.types';

export const ModelDecisionsPanel: React.FC = () => {
  const { useDecisions } = useAiGovernance();
  const { data: response, isLoading } = useDecisions();

  const decisions = response?.data || [
    { id: '1', model_id: 'Clinical Pathway Recommender', input: { patient_age: 65, symptoms: ['chest_pain'] }, output: { pathway: 'cardiac_eval', confidence: 0.94 }, decision: 'approved', created_at: new Date().toISOString() },
    { id: '2', model_id: 'Readmission Risk Predictor', input: { los_days: 12, comorbidities: 3 }, output: { risk_score: 0.88, threshold: 0.75 }, decision: 'flagged_for_review', created_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading decisions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="AI Inference Audit Log" />
      <CardBody>
        <div className="space-y-4">
          {decisions.map((d: ModelDecision) => (
            <div key={d.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-gray-200">{d.model_id}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${d.decision === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {d.decision.toUpperCase().replace(/_/g, ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-black/40 p-2 rounded">
                  <span className="text-gray-500 mb-1 block">Input Payload:</span>
                  <span className="text-gray-300">{JSON.stringify(d.input)}</span>
                </div>
                <div className="bg-black/40 p-2 rounded">
                  <span className="text-gray-500 mb-1 block">Output Prediction:</span>
                  <span className="text-emerald-300">{JSON.stringify(d.output)}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 mt-2 text-right">{new Date(d.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
