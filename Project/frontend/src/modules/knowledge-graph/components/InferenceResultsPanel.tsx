import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import type { InferenceResult } from '../types/knowledge-graph.types';

export const InferenceResultsPanel: React.FC = () => {
  const { useInferences } = useKnowledgeGraph();
  const { data: response, isLoading } = useInferences();

  const inferences = response?.data || [
    { id: '1', node_id: 'node-A41 (Patient)', inferred_relations: { POTENTIAL_RISK: 'Hypoglycemia', SUGGESTED_CONSULT: 'Endocrinology' } },
    { id: '2', node_id: 'node-C03 (Protocol)', inferred_relations: { CONFLICTS_WITH: 'AHA-2023-Deprecated' } }
  ];

  if (isLoading) return <div>Loading AI inferences...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="AI-Inferred Relationships" />
      <CardBody>
        <div className="space-y-3">
          {inferences.map((inf: InferenceResult) => (
            <div key={inf.id} className="p-3 border-l-4 border-l-purple-500 bg-purple-500/10 rounded border border-white/5">
              <p className="text-sm font-semibold text-gray-200 mb-2">{inf.node_id}</p>
              <div className="flex flex-col gap-2">
                {Object.entries(inf.inferred_relations).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[12px] bg-black/40 px-3 py-1.5 rounded">
                    <span className="text-purple-300 font-mono text-[10px]">{k}</span>
                    <span className="text-white font-medium">{String(v)}</span>
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
