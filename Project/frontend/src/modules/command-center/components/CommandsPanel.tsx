import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCommandCenter } from '../hooks/useCommandCenter';
import type { Command } from '../types/command-center.types';

export const CommandsPanel: React.FC = () => {
  const { useCommands } = useCommandCenter();
  const { data: response, isLoading } = useCommands();

  const commands = response?.data || [
    { id: 'CMD-881', target_system: 'notification-service', action: 'restart', payload: { force: true }, status: 'completed' },
    { id: 'CMD-882', target_system: 'optimization-engine', action: 'scale_up', payload: { replicas: 5 }, status: 'executing' },
    { id: 'CMD-883', target_system: 'digital-twin', action: 'trigger_simulation', payload: { scenario: 'code_black' }, status: 'failed' }
  ];

  if (isLoading) return <div>Loading operational commands...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'executing': return 'outline';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Operational Commands Dispatched" />
      <CardBody>
        <div className="space-y-4">
          {commands.map((cmd: Command) => (
            <div key={cmd.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-blue-400 mb-1">{cmd.action.toUpperCase()}</p>
                <p className="text-xs text-gray-400 font-mono mb-2">Target: {cmd.target_system}</p>
                <div className="bg-black/40 px-2 py-1 rounded text-[10px] text-gray-500 font-mono inline-block">
                  {JSON.stringify(cmd.payload)}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="text-xs text-gray-500 font-mono">{cmd.id}</span>
                <Badge variant={statusVariant(cmd.status)}>
                  {cmd.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
