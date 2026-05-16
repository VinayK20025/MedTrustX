import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useVisitorManagement } from '../hooks/useVisitorManagement';
import type { Visitor } from '../types/visitor-management.types';

export const VisitorsPanel: React.FC = () => {
  const { useVisitors } = useVisitorManagement();
  const { data: response, isLoading } = useVisitors();

  const visitors = response?.data || [
    { id: '1', name: 'Rajesh Kumar', id_type: 'driving_license', id_value: 'DL-****-7842' },
    { id: '2', name: 'Anita Sharma', id_type: 'passport', id_value: 'PP-****-3291' },
    { id: '3', name: 'James Wilson', id_type: 'employee_id', id_value: 'EMP-****-0045' }
  ];

  if (isLoading) return <div>Loading visitors...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Visitor Registry" />
      <CardBody>
        <div className="space-y-4">
          {visitors.map((v: Visitor) => (
            <div key={v.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{v.name}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{v.id_type.replace('_', ' ')}</p>
              </div>
              <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">{v.id_value}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
