import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLegalCaseManagement } from '../hooks/useLegalCaseManagement';
import type { ComplianceRecord } from '../types/legal-case.types';

export const ComplianceRecordsPanel: React.FC = () => {
  const { useComplianceRecords } = useLegalCaseManagement();
  const { data: response, isLoading } = useComplianceRecords();

  const records = response?.data || [
    { id: '1', case_id: '2', regulation: 'HIPAA', status: 'compliant' },
    { id: '2', case_id: '2', regulation: 'GDPR', status: 'review' }
  ];

  if (isLoading) return <div>Loading compliance records...</div>;

  const statusVariant = (s: string) => s === 'compliant' ? 'success' : s === 'non_compliant' ? 'danger' : 'warning';

  return (
    <Card className="h-full">
      <CardHeader title="Regulatory Compliance" />
      <CardBody>
        <div className="space-y-3">
          {records.map((rec: ComplianceRecord) => (
            <div key={rec.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-bold text-gray-200">{rec.regulation}</p>
                <p className="text-xs text-gray-500">Case: {rec.case_id}</p>
              </div>
              <Badge variant={statusVariant(rec.status)}>
                {rec.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
