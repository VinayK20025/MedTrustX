import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useBoardReporting } from '../hooks/useBoardReporting';
import type { ReportDistribution } from '../types/board-reporting.types';

export const ReportDistributionPanel: React.FC = () => {
  const { useDistributions } = useBoardReporting();
  const { data: response, isLoading } = useDistributions();

  const distributions = response?.data || [
    { id: '1', report_id: '1', recipient_id: 'director-alpha', status: 'read', sent_at: new Date().toISOString() },
    { id: '2', report_id: '1', recipient_id: 'director-beta', status: 'sent', sent_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading distributions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Distribution Tracking" />
      <CardBody>
        <div className="space-y-3">
          {distributions.map((dist: ReportDistribution) => (
            <div key={dist.id} className="flex justify-between items-center p-3 rounded bg-white/5">
              <div>
                <p className="text-sm font-semibold text-gray-200">Recipient: {dist.recipient_id}</p>
                <p className="text-xs text-gray-500">Sent: {dist.sent_at ? new Date(dist.sent_at).toLocaleTimeString() : 'N/A'}</p>
              </div>
              <Badge variant={dist.status === 'read' ? 'success' : 'warning'}>
                {dist.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
