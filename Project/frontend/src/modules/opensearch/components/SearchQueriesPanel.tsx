import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useOpenSearch } from '../hooks/useOpenSearch';
import type { SearchQuery } from '../types/opensearch.types';

export const SearchQueriesPanel: React.FC = () => {
  const { useQueries } = useOpenSearch();
  const { data: response, isLoading } = useQueries();

  const queries = response?.data || [
    { id: 'q-991', query: '{"query":{"match":{"notes":"hypertension"}}}', result_count: 142, executed_at: new Date(Date.now() - 300000).toISOString() },
    { id: 'q-992', query: '{"query":{"term":{"action":"FAILED_LOGIN"}}}', result_count: 8, executed_at: new Date(Date.now() - 600000).toISOString() }
  ];

  if (isLoading) return <div>Loading search queries...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Search Query Execution Audit" />
      <CardBody>
        <ul className="space-y-3">
          {queries.map((q: SearchQuery) => (
            <li key={q.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3 w-2/3">
                <div className="bg-amber-500/20 text-amber-400 p-1.5 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="truncate w-full font-mono text-[10px] text-gray-300">
                  {q.query}
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={`text-sm font-bold ${q.result_count === 0 ? 'text-gray-500' : 'text-emerald-400'}`}>
                  {q.result_count} hits
                </span>
                <span className="text-[10px] text-gray-500 font-mono mt-1">{new Date(q.executed_at).toLocaleTimeString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
