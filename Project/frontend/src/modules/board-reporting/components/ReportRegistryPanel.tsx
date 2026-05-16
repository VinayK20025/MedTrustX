import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useBoardReporting } from '../hooks/useBoardReporting';
import type { Report } from '../types/board-reporting.types';

export const ReportRegistryPanel: React.FC = () => {
  const { useReports } = useBoardReporting();
  const { data: response, isLoading } = useReports();

  const reports = response?.data || [
    { id: '1', title: 'Q3 Financial & Operations Summary', type: 'quarterly', status: 'published' },
    { id: '2', title: 'Annual Compliance Audit', type: 'compliance', status: 'draft' }
  ];

  if (isLoading) return <div>Loading reports...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Report Registry" />
      <CardBody>
        <div className="space-y-4">
          {reports.map((rpt: Report) => (
            <div key={rpt.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{rpt.title}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{rpt.type} Report</p>
              </div>
              <Badge variant={rpt.status === 'published' ? 'success' : 'outline'}>
                {rpt.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
