import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useLitigationTracking } from '../hooks/useLitigationTracking';
import type { LitigationUpdate } from '../types/litigation.types';

export const LitigationUpdatesPanel: React.FC = () => {
  const { useUpdates } = useLitigationTracking();
  const { data: response, isLoading } = useUpdates();

  const updates = response?.data || [
    { id: '1', litigation_id: '1', update_type: 'status_change', details: { from: 'filed', to: 'in_progress' } },
    { id: '2', litigation_id: '1', update_type: 'document_filed', details: { document: 'Counter-affidavit' } }
  ];

  if (isLoading) return <div>Loading updates...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Timeline Updates" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {updates.map((upd: LitigationUpdate) => (
            <li key={upd.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-purple-500" />
              <p className="text-sm font-medium text-purple-400 capitalize">{upd.update_type.replace('_', ' ')}</p>
              <p className="text-xs text-gray-400 mt-1">
                {JSON.stringify(upd.details)}
              </p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
