import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useVisitorManagement } from '../hooks/useVisitorManagement';
import type { Visit } from '../types/visitor-management.types';

export const VisitsPanel: React.FC = () => {
  const { useVisits } = useVisitorManagement();
  const { data: response, isLoading } = useVisits();

  const visits = response?.data || [
    { id: '1', visitor_id: '1', host_id: 'dr-patel', purpose: 'Patient visit - Ward 3A', status: 'active', check_in: new Date().toISOString(), check_out: null },
    { id: '2', visitor_id: '2', host_id: 'admin-office', purpose: 'Vendor meeting', status: 'scheduled', check_in: null, check_out: null }
  ];

  if (isLoading) return <div>Loading visits...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': return 'success';
      case 'scheduled': return 'warning';
      case 'completed': return 'outline';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Visit Schedule" />
      <CardBody>
        <div className="space-y-3">
          {visits.map((v: Visit) => (
            <div key={v.id} className="p-3 bg-white/5 rounded border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">{v.purpose}</span>
                <Badge variant={statusVariant(v.status)}>
                  {v.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Host: {v.host_id}</p>
              {v.check_in && <p className="text-xs text-gray-500">In: {new Date(v.check_in).toLocaleString()}</p>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
