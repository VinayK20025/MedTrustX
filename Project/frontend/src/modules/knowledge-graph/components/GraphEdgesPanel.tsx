import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import type { GraphEdge } from '../types/knowledge-graph.types';

export const GraphEdgesPanel: React.FC = () => {
  const { useEdges } = useKnowledgeGraph();
  const { data: response, isLoading } = useEdges();

  const edges = response?.data || [
    { id: 'edge-1', source_node: 'node-A41 (Patient)', target_node: 'node-B92 (Medication)', relation_type: 'PRESCRIBED', properties: { date: '2026-05-01', compliance: 0.95 } },
    { id: 'edge-2', source_node: 'node-A41 (Patient)', target_node: 'node-C03 (Protocol)', relation_type: 'FOLLOWS', properties: { adherence_score: 88 } }
  ];

  if (isLoading) return <div>Loading relationships...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Semantic Relationships (Edges)" />
      <CardBody>
        <div className="space-y-4">
          {edges.map((e: GraphEdge) => (
            <div key={e.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-blue-400 truncate w-32">{e.source_node}</span>
                <div className="flex-1 text-center text-[10px] text-gray-500 font-mono">
                  <div className="border-b border-gray-500 mb-1" />
                  {e.relation_type}
                </div>
                <span className="text-sm font-semibold text-emerald-400 truncate w-32 text-right">{e.target_node}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-2 font-mono text-center">
                {Object.keys(e.properties).length > 0 ? JSON.stringify(e.properties) : '{}'}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
