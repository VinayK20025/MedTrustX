import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRiskOversight } from '../hooks/useRiskOversight';
import type { RiskEvent } from '../types/risk-oversight.types';

export const RiskEventsPanel: React.FC = () => {
  const { useRiskEvents } = useRiskOversight();
  const { data: response, isLoading } = useRiskEvents();

  const events = response?.data || [
    { id: '1', risk_id: '1', event_type: 'identified', details: { source: 'Audit Report' } },
    { id: '2', risk_id: '2', event_type: 'assessed', details: { score_change: '+15' } }
  ];

  if (isLoading) return <div>Loading risk events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Audit Trail & Events" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {events.map((event: RiskEvent) => (
            <li key={event.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-teal-500" />
              <p className="text-sm font-medium text-teal-400">{event.event_type.toUpperCase()}</p>
              <p className="text-xs text-gray-400 mt-1">
                {JSON.stringify(event.details)}
              </p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
