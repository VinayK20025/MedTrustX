import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEvidenceManagement } from '../hooks/useEvidenceManagement';
import type { EvidenceItem } from '../types/evidence.types';

export const EvidenceItemsPanel: React.FC = () => {
  const { useItems } = useEvidenceManagement();
  const { data: response, isLoading } = useItems();

  const items = response?.data || [
    { id: '1', case_id: 'CASE-2026-001', type: 'cctv_footage', file_path: '/vault/ev/cctv_ward3_20260115.mp4', hash: 'a3f2…c91d' },
    { id: '2', case_id: 'CASE-2026-001', type: 'legal_doc', file_path: '/vault/ev/consent_form_patient_42.pdf', hash: 'b7e1…f03a' }
  ];

  if (isLoading) return <div>Loading evidence items...</div>;

  const typeColor = (t: string) => {
    switch (t) {
      case 'cctv_footage': return 'danger';
      case 'legal_doc': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Evidence Registry" />
      <CardBody>
        <div className="space-y-4">
          {items.map((item: EvidenceItem) => (
            <div key={item.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-100 text-sm">{item.file_path.split('/').pop()}</p>
                  <p className="text-xs text-gray-500 mt-1">Case: {item.case_id}</p>
                </div>
                <Badge variant={typeColor(item.type)}>
                  {item.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 font-mono">SHA-256: {item.hash}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
