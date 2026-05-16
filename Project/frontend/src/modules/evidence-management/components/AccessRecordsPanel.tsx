import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEvidenceManagement } from '../hooks/useEvidenceManagement';
import type { AccessRecord } from '../types/evidence.types';

export const AccessRecordsPanel: React.FC = () => {
  const { useAccessRecords } = useEvidenceManagement();
  const { data: response, isLoading } = useAccessRecords();

  const records = response?.data || [
    { id: '1', evidence_id: '1', user_id: 'forensic-officer-01', action: 'view' },
    { id: '2', evidence_id: '2', user_id: 'legal-counsel-03', action: 'download' }
  ];

  if (isLoading) return <div>Loading access records...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Access Audit Log" />
      <CardBody>
        <div className="space-y-3">
          {records.map((rec: AccessRecord) => (
            <div key={rec.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{rec.user_id}</p>
                <p className="text-xs text-gray-500">Evidence: {rec.evidence_id}</p>
              </div>
              <Badge variant={rec.action === 'download' ? 'warning' : 'outline'}>
                {rec.action.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
