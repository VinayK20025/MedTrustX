'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard } from '@/modules/infection-control';

export default function InfectionReportsPage() {
  const { data, isLoading } = useInfectionControlDashboard({});

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const kpis = data?.data?.kpis ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Reports' }]} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader title={kpi.label} />
            <CardBody>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              {kpi.subLabel && <p className="text-xs text-gray-500 mt-1">{kpi.subLabel}</p>}
            </CardBody>
          </Card>
        ))}
        {kpis.length === 0 && (
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody className="text-sm text-gray-500 text-center py-8">No report data available.</CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
