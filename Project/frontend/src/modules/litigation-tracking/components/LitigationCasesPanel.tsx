import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLitigationTracking } from '../hooks/useLitigationTracking';
import type { Litigation } from '../types/litigation.types';

export const LitigationCasesPanel: React.FC = () => {
  const { useLitigations } = useLitigationTracking();
  const { data: response, isLoading } = useLitigations();

  const litigations = response?.data || [
    { id: '1', case_id: 'LIT-2026-003', court_name: 'Delhi High Court', status: 'in_progress', filed_at: '2026-01-15T10:00:00Z' },
    { id: '2', case_id: 'LIT-2026-009', court_name: 'NCDRC Consumer Forum', status: 'filed', filed_at: '2026-03-22T08:30:00Z' }
  ];

  if (isLoading) return <div>Loading litigation cases...</div>;

  const statusVariant = (s: string) => s === 'in_progress' ? 'warning' : s === 'resolved' ? 'success' : 'outline';

  return (
    <Card className="h-full">
      <CardHeader title="Active Litigations" />
      <CardBody>
        <div className="space-y-4">
          {litigations.map((lit: Litigation) => (
            <div key={lit.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-100">{lit.case_id}</p>
                  <p className="text-sm text-gray-400">{lit.court_name}</p>
                </div>
                <Badge variant={statusVariant(lit.status)}>
                  {lit.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Filed: {new Date(lit.filed_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
