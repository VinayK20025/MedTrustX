import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useOpenSearch } from '../hooks/useOpenSearch';
import type { IndexedDocument } from '../types/opensearch.types';

export const IndexedDocumentsPanel: React.FC = () => {
  const { useDocuments } = useOpenSearch();
  const { data: response, isLoading } = useDocuments();

  const docs = response?.data || [
    { id: 'doc-8912', index_name: 'clinical-records-v1', created_at: new Date(Date.now() - 3600000).toISOString(), document: { patient_id: 'PT-99', notes: 'Patient resting comfortably. Vitals stable.' } },
    { id: 'doc-8913', index_name: 'audit-logs-2026.05', created_at: new Date(Date.now() - 1200000).toISOString(), document: { action: 'LOGIN_ATTEMPT', ip: '192.168.1.5' } }
  ];

  if (isLoading) return <div>Loading documents...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Recent Indexed Documents" />
      <CardBody>
        <div className="space-y-4">
          {docs.map((doc: IndexedDocument) => (
            <div key={doc.id} className="p-3 border-l-4 border-l-blue-500 rounded bg-white/5 border border-white/10 flex flex-col md:flex-row gap-4">
              <div className="min-w-[150px]">
                <p className="text-sm font-semibold text-gray-200">{doc.index_name}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {doc.id}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">{new Date(doc.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex-1 bg-black/60 p-2 rounded text-[10px] text-gray-400 font-mono overflow-x-auto whitespace-nowrap">
                {JSON.stringify(doc.document)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
