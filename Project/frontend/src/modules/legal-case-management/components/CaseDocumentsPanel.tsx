import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLegalCaseManagement } from '../hooks/useLegalCaseManagement';
import type { CaseDocument } from '../types/legal-case.types';

export const CaseDocumentsPanel: React.FC = () => {
  const { useDocuments } = useLegalCaseManagement();
  const { data: response, isLoading } = useDocuments();

  const docs = response?.data || [
    { id: '1', case_id: '1', document_type: 'complaint_filing', file_path: '/vault/legal/complaint_LC2026001.pdf' },
    { id: '2', case_id: '1', document_type: 'witness_statement', file_path: '/vault/legal/witness_stmt_dr_kumar.pdf' }
  ];

  if (isLoading) return <div>Loading documents...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Case Documents" />
      <CardBody>
        <div className="space-y-3">
          {docs.map((doc: CaseDocument) => (
            <div key={doc.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{doc.file_path.split('/').pop()}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{doc.document_type.replace('_', ' ')}</p>
              </div>
              <Badge variant="outline">PDF</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
