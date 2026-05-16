import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLitigationTracking } from '../hooks/useLitigationTracking';
import type { Hearing } from '../types/litigation.types';

export const HearingsPanel: React.FC = () => {
  const { useHearings } = useLitigationTracking();
  const { data: response, isLoading } = useHearings();

  const hearings = response?.data || [
    { id: '1', litigation_id: '1', hearing_date: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'scheduled', notes: 'Cross-examination of witnesses' },
    { id: '2', litigation_id: '2', hearing_date: new Date(Date.now() + 86400000 * 21).toISOString(), status: 'scheduled', notes: null }
  ];

  if (isLoading) return <div>Loading hearings...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Upcoming Hearings" />
      <CardBody>
        <div className="space-y-3">
          {hearings.map((h: Hearing) => (
            <div key={h.id} className="p-3 bg-white/5 rounded border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-emerald-400">
                  {new Date(h.hearing_date).toLocaleDateString()}
                </span>
                <Badge variant={h.status === 'completed' ? 'success' : 'outline'}>
                  {h.status.toUpperCase()}
                </Badge>
              </div>
              {h.notes && <p className="text-xs text-gray-400 mt-1">{h.notes}</p>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
