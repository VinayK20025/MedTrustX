import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useBoardReporting } from '../hooks/useBoardReporting';
import type { ReportSchedule } from '../types/board-reporting.types';

export const ReportSchedulesPanel: React.FC = () => {
  const { useSchedules } = useBoardReporting();
  const { data: response, isLoading } = useSchedules();

  const schedules = response?.data || [
    { id: '1', report_id: '1', frequency: 'quarterly', next_run: new Date(Date.now() + 86400000 * 30).toISOString() },
    { id: '2', report_id: '2', frequency: 'annual', next_run: new Date(Date.now() + 86400000 * 180).toISOString() }
  ];

  if (isLoading) return <div>Loading schedules...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Generation Schedules" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((sch: ReportSchedule) => (
            <div key={sch.id} className="p-4 bg-white/5 rounded-md border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Report ID: {sch.report_id.slice(0, 8)}</span>
                <Badge variant="outline">{sch.frequency.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-gray-400">Next Run:</p>
              <p className="text-sm font-medium text-emerald-400">
                {new Date(sch.next_run).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
