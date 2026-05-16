import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLegalRiskAnalytics } from '../hooks/useLegalRiskAnalytics';
import type { PredictiveModel } from '../types/legal-risk.types';

export const PredictiveModelsPanel: React.FC = () => {
  const { usePredictiveModels } = useLegalRiskAnalytics();
  const { data: response, isLoading } = usePredictiveModels();

  const models = response?.data || [
    { id: '1', model_name: 'Malpractice Outcome Predictor', version: 'v2.3.1', accuracy: 0.89 },
    { id: '2', model_name: 'Settlement Value Estimator', version: 'v1.7.0', accuracy: 0.82 }
  ];

  if (isLoading) return <div>Loading models...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Deployed Predictive Models" />
      <CardBody>
        <div className="space-y-3">
          {models.map((model: PredictiveModel) => (
            <div key={model.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{model.model_name}</p>
                <p className="text-xs text-gray-500 mt-1">Version: {model.version}</p>
              </div>
              <Badge variant={model.accuracy > 0.85 ? 'success' : 'warning'}>
                {(model.accuracy * 100).toFixed(1)}% Accuracy
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
