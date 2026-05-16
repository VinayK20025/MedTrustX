import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLegalCaseManagement } from '../hooks/useLegalCaseManagement';
import type { LegalCase } from '../types/legal-case.types';

export const LegalCasesPanel: React.FC = () => {
  const { useCases } = useLegalCaseManagement();
  const { data: response, isLoading } = useCases();

  const cases = response?.data || [
    { id: '1', case_number: 'LC-2026-001', type: 'litigation', status: 'open' },
    { id: '2', case_number: 'LC-2026-007', type: 'compliance', status: 'under_review' },
    { id: '3', case_number: 'LC-2026-012', type: 'HR', status: 'closed' }
  ];

  if (isLoading) return <div>Loading cases...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'open': return 'danger';
      case 'under_review': return 'warning';
      case 'closed': return 'success';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Legal Case Registry" />
      <CardBody>
        <div className="space-y-4">
          {cases.map((lc: LegalCase) => (
            <div key={lc.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{lc.case_number}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{lc.type} Matter</p>
              </div>
              <Badge variant={statusVariant(lc.status)}>
                {lc.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
