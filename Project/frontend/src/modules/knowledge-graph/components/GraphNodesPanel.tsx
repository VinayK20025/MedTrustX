import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import type { GraphNode } from '../types/knowledge-graph.types';

export const GraphNodesPanel: React.FC = () => {
  const { useNodes } = useKnowledgeGraph();
  const { data: response, isLoading } = useNodes();

  const nodes = response?.data || [
    { id: 'node-A41', entity_type: 'Patient', properties: { age: 45, condition: 'Type 2 Diabetes' } },
    { id: 'node-B92', entity_type: 'Medication', properties: { name: 'Metformin', dosage: '500mg' } },
    { id: 'node-C03', entity_type: 'Protocol', properties: { code: 'AHA-2026-Guideline', status: 'active' } }
  ];

  if (isLoading) return <div>Loading graph nodes...</div>;

  const typeVariant = (t: string) => {
    switch (t) {
      case 'Patient': return 'outline';
      case 'Medication': return 'success';
      case 'Protocol': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Graph Entity Nodes" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes.map((n: GraphNode) => (
            <div key={n.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-mono text-gray-400">{n.id}</span>
                <Badge variant={typeVariant(n.entity_type)}>
                  {n.entity_type}
                </Badge>
              </div>
              <div className="text-[11px] font-mono text-gray-300 mt-3 break-words bg-black/40 p-2 rounded">
                {JSON.stringify(n.properties)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
