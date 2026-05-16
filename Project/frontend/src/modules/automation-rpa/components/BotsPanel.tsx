import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAutomationRpa } from '../hooks/useAutomationRpa';
import type { Bot } from '../types/automation-rpa.types';

export const BotsPanel: React.FC = () => {
  const { useBots } = useAutomationRpa();
  const { data: response, isLoading } = useBots();

  const bots = response?.data || [
    { id: '1', name: 'Billing-Worker-01', type: 'api_worker', status: 'busy' },
    { id: '2', name: 'UI-Scraper-Alpha', type: 'browser_bot', status: 'idle' },
    { id: '3', name: 'Legacy-Terminal-Bot', type: 'mainframe_emulator', status: 'offline' }
  ];

  if (isLoading) return <div>Loading bots...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'idle': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'danger';
      default: return 'outline' as const;
    }
  };

  const typeIcon = (t: string) => {
    if (t.includes('api')) return '⚡';
    if (t.includes('browser')) return '🌐';
    if (t.includes('mainframe')) return '🖥️';
    return '🤖';
  };

  return (
    <Card className="h-full">
      <CardHeader title="RPA Bot Fleet" />
      <CardBody>
        <div className="space-y-3">
          {bots.map((b: Bot) => (
            <div key={b.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">{typeIcon(b.type)}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{b.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize mt-0.5">{b.type.replace('_', ' ')}</p>
                </div>
              </div>
              <Badge variant={statusVariant(b.status)}>
                {b.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
