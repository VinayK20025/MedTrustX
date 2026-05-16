import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNetworkObservability } from '../hooks/useNetworkObservability';
import type { NetworkFlow } from '../types/network-observability.types';

export const NetworkFlowsPanel: React.FC = () => {
  const { useFlows } = useNetworkObservability();
  const { data: response, isLoading } = useFlows();

  const flows = response?.data || [
    { id: '1', source_ip: '10.0.1.45', destination_ip: '10.0.2.12', protocol: 'TCP', bytes: 1048576, timestamp: new Date().toISOString() },
    { id: '2', source_ip: '10.0.3.8', destination_ip: '10.0.1.1', protocol: 'UDP', bytes: 524288, timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading flows...</div>;

  const formatBytes = (b: number) => {
    if (b >= 1073741824) return `${(b / 1073741824).toFixed(1)} GB`;
    if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
    return `${(b / 1024).toFixed(0)} KB`;
  };

  return (
    <Card className="h-full">
      <CardHeader title="Network Flow Records" />
      <CardBody>
        <div className="space-y-3">
          {flows.map((flow: NetworkFlow) => (
            <div key={flow.id} className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-blue-400">{flow.source_ip}</span>
                <span className="text-xs text-gray-500">&rarr;</span>
                <span className="text-sm font-mono text-teal-400">{flow.destination_ip}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{flow.protocol}</p>
                <p className="text-sm font-bold text-white">{formatBytes(flow.bytes)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
