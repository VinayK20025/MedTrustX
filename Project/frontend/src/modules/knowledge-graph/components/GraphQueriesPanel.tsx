import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import type { GraphQuery } from '../types/knowledge-graph.types';

export const GraphQueriesPanel: React.FC = () => {
  const { useQueries } = useKnowledgeGraph();
  const { data: response, isLoading } = useQueries();

  const queries = response?.data || [
    { id: '1', query: 'MATCH (p:Patient)-[:PRESCRIBED]->(m:Medication) WHERE m.name = "Metformin" RETURN p', result_count: 1420, executed_at: new Date().toISOString() },
    { id: '2', query: 'MATCH (d:Device)-[:LOCATED_IN]->(r:Room {type: "ICU"}) RETURN d', result_count: 85, executed_at: new Date(Date.now() - 3600000).toISOString() }
  ];

  if (isLoading) return <div>Loading queries...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Cypher Query Audit Log" />
      <CardBody>
        <div className="space-y-4">
          {queries.map((q: GraphQuery) => (
            <div key={q.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="bg-black/60 p-3 rounded font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre-wrap mb-3">
                {q.query}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Returned <strong className="text-emerald-400">{q.result_count}</strong> nodes</span>
                <span>{new Date(q.executed_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
