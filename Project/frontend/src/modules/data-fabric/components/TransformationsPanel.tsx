import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useDataFabric } from '../hooks/useDataFabric';
import type { Transformation } from '../types/data-fabric.types';

export const TransformationsPanel: React.FC = () => {
  const { useTransformations } = useDataFabric();
  const { data: response, isLoading } = useTransformations();

  const transformations = response?.data || [
    { id: '1', pipeline_id: 'Legacy EMR Ingestion', mapping: { source_field: 'pt_dob', target_field: 'date_of_birth', type: 'date_format', format: 'YYYY-MM-DD' } },
    { id: '2', pipeline_id: 'Legacy EMR Ingestion', mapping: { source_field: 'ssn', target_field: 'ssn', type: 'masking', rule: 'last_4' } }
  ];

  if (isLoading) return <div>Loading transformations...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Schema Transformations" />
      <CardBody>
        <div className="space-y-4">
          {transformations.map((t: Transformation) => (
            <div key={t.id} className="p-3 border border-white/10 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-2 font-mono">Pipeline: {t.pipeline_id}</p>
              <div className="bg-black/60 p-2 rounded text-xs font-mono">
                <div className="flex justify-between mb-1">
                  <span className="text-blue-300">{t.mapping.source_field}</span>
                  <span className="text-emerald-500">→</span>
                  <span className="text-emerald-300">{t.mapping.target_field}</span>
                </div>
                <div className="text-gray-400 mt-2 flex gap-2">
                  <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase text-[10px]">{t.mapping.type}</span>
                  {t.mapping.format && <span>Format: {t.mapping.format}</span>}
                  {t.mapping.rule && <span>Rule: {t.mapping.rule}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
