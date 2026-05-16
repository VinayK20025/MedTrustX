import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useVisitorManagement } from '../hooks/useVisitorManagement';
import type { VisitorBadge } from '../types/visitor-management.types';

export const BadgesPanel: React.FC = () => {
  const { useBadges } = useVisitorManagement();
  const { data: response, isLoading } = useBadges();

  const badges = response?.data || [
    { id: '1', visit_id: '1', badge_code: 'VIS-2026-0431', status: 'issued', issued_at: new Date().toISOString() },
    { id: '2', visit_id: '2', badge_code: 'VIS-2026-0432', status: 'pending', issued_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading badges...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Visitor Badges" />
      <CardBody>
        <div className="space-y-3">
          {badges.map((b: VisitorBadge) => (
            <div key={b.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-mono font-bold text-blue-400">{b.badge_code}</p>
                <p className="text-xs text-gray-500 mt-1">Issued: {new Date(b.issued_at).toLocaleString()}</p>
              </div>
              <Badge variant={b.status === 'issued' ? 'success' : 'warning'}>
                {b.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
