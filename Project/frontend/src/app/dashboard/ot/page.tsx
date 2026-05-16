'use client';
import React, { useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useUIStore } from '@/store/ui.store';
import { useOTDashboard } from '@/modules/ot-nurse';

export default function OTManagementPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useOTDashboard({});

  useEffect(() => {
    setPageMeta('OT Management', 'Operating theatre schedule, case flow, and safety overview');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) {
    return <div className="text-gray-500 py-20 text-center">No data available</div>;
  }

  const cases = dashboard.activeCase
    ? [dashboard.activeCase, ...dashboard.upcomingCases]
    : dashboard.upcomingCases;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operations' }, { label: 'OT Management' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dashboard.kpis.map((kpi) => (
          <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader title={kpi.title} />
            <CardBody>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              {kpi.delta && <p className="text-xs text-gray-500 mt-1">{kpi.delta}</p>}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="OT Case Flow" subtitle="Active and upcoming surgeries" />
        <CardBody className="space-y-3">
          {cases.map((otCase) => (
            <div
              key={otCase.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <div>
                <p className="text-sm text-white font-semibold">{otCase.patientName}</p>
                <p className="text-xs text-gray-500">{otCase.procedure} · {otCase.room}</p>
                <p className="text-2xs text-gray-600">Start {otCase.startTime}</p>
              </div>
              <Badge size="sm" variant={otCase.status === 'intra_op' ? 'success' : 'outline'}>
                {otCase.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
          {cases.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-6">No OT cases scheduled.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
