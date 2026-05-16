import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAiGovernance } from '../hooks/useAiGovernance';
import type { ModelEntity } from '../types/ai-governance.types';

export const AiModelsPanel: React.FC = () => {
  const { useModels } = useAiGovernance();
  const { data: response, isLoading } = useModels();

  const models = response?.data || [
    { id: '1', name: 'Clinical Pathway Recommender', version: 'v2.1.0', status: 'active' },
    { id: '2', name: 'Radiology Anomaly Detector', version: 'v4.0.5-beta', status: 'active' },
    { id: '3', name: 'Readmission Risk Predictor', version: 'v1.2.0', status: 'quarantined' }
  ];

  if (isLoading) return <div>Loading AI models...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': return 'success';
      case 'quarantined': return 'danger';
      case 'training': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Governed AI/ML Models" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m: ModelEntity) => (
            <div key={m.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-blue-400">{m.name}</span>
                <Badge variant={statusVariant(m.status)}>
                  {m.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 font-mono">Version: {m.version}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
