import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useOpenSearch } from '../hooks/useOpenSearch';
import type { SearchIndex } from '../types/opensearch.types';

export const SearchIndicesPanel: React.FC = () => {
  const { useIndices } = useOpenSearch();
  const { data: response, isLoading } = useIndices();

  const indices = response?.data || [
    { id: '1', index_name: 'clinical-records-v1', mappings: { properties: { patient_id: { type: 'keyword' }, notes: { type: 'text' } } } },
    { id: '2', index_name: 'audit-logs-2026.05', mappings: { properties: { timestamp: { type: 'date' }, action: { type: 'keyword' } } } }
  ];

  if (isLoading) return <div>Loading search indices...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="OpenSearch Index Topology" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indices.map((idx: SearchIndex) => (
            <div key={idx.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col h-full">
              <h3 className="text-sm font-bold text-blue-400 mb-2 font-mono flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                {idx.index_name}
              </h3>
              <div className="bg-black/40 p-2 rounded text-[10px] text-gray-400 font-mono mt-auto overflow-x-auto">
                <pre>{JSON.stringify(idx.mappings, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
