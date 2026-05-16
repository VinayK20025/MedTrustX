import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useIot } from '../hooks/useIot';
import type { DeviceCommand } from '../types/iot.types';

export const CommandsPanel: React.FC = () => {
  const { useCommands } = useIot();
  const { data: response, isLoading } = useCommands();

  const commands = response?.data || [
    { id: 'cmd-1', device_id: 'dev-infusion-1A', command: { action: 'pause' }, status: 'delivered', sent_at: '2026-05-02T14:05:00Z' },
    { id: 'cmd-2', device_id: 'dev-ekg-4B', command: { action: 'restart' }, status: 'pending', sent_at: '2026-05-02T14:12:00Z' },
  ];

  if (isLoading) return <div>Loading commands...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Device Commands" />
      <CardBody>
        <div className="space-y-3">
          {commands.map((cmd: DeviceCommand) => (
            <div key={cmd.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-gray-200 block">{cmd.device_id}</span>
                <span className="font-mono text-[10px] text-amber-400">{JSON.stringify(cmd.command)}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                cmd.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                cmd.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {cmd.status}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
