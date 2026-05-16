import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePerimeterSecurity } from '../hooks/usePerimeterSecurity';
import type { ResponseAction } from '../types/perimeter-security.types';

export const ResponseActionsPanel: React.FC = () => {
  const { useResponses } = usePerimeterSecurity();
  const { data: response, isLoading } = useResponses();

  const actions = response?.data || [
    { id: '1', event_id: '2', action_type: 'activate_floodlights', status: 'triggered', triggered_at: new Date().toISOString() },
    { id: '2', event_id: '2', action_type: 'dispatch_security_patrol', status: 'completed', triggered_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading response actions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Automated Response Actions" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {actions.map((a: ResponseAction) => (
            <li key={a.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${a.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold capitalize">{a.action_type.replace(/_/g, ' ')}</span>
                <Badge variant={a.status === 'completed' ? 'success' : 'warning'}>
                  {a.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Triggered: {new Date(a.triggered_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
