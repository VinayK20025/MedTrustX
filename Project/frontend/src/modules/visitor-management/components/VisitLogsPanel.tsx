import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useVisitorManagement } from '../hooks/useVisitorManagement';
import type { VisitLog } from '../types/visitor-management.types';

export const VisitLogsPanel: React.FC = () => {
  const { useVisitLogs } = useVisitorManagement();
  const { data: response, isLoading } = useVisitLogs();

  const logs = response?.data || [
    { id: '1', visit_id: '1', event_type: 'check_in' },
    { id: '2', visit_id: '1', event_type: 'badge_printed' },
    { id: '3', visit_id: '2', event_type: 'scheduled' }
  ];

  if (isLoading) return <div>Loading visit logs...</div>;

  const eventIcon = (t: string) => {
    switch (t) {
      case 'check_in': return '✅';
      case 'check_out': return '🚪';
      case 'badge_printed': return '🪪';
      case 'scheduled': return '📅';
      default: return '📋';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Visit Audit Trail" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {logs.map((log: VisitLog) => (
            <li key={log.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-teal-500" />
              <div className="flex items-center gap-2">
                <span>{eventIcon(log.event_type)}</span>
                <span className="text-sm font-medium capitalize">{log.event_type.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Visit: {log.visit_id}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
