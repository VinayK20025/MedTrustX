'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard, useIsolatePatient } from '@/modules/infection-control';

export default function InfectionIsolationPage() {
  const { data, isLoading } = useInfectionControlDashboard({});
  const { mutate: isolate } = useIsolatePatient();

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const cases = (data?.data?.cases ?? []).filter((c) => c.status === 'Active');
  const isolated = cases.filter((c) => c.isolated);
  const pending = cases.filter((c) => !c.isolated);

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Isolation' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Pending Isolation" subtitle="Active cases without isolation" />
          <CardBody className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white font-semibold">{c.patientTag} · {c.infectionType}</p>
                  <p className="text-xs text-gray-500">{c.ward}</p>
                </div>
                <button className="text-xs text-orange-300 hover:text-orange-200" onClick={() => isolate(c.id)}>
                  Isolate
                </button>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-6">No pending isolation cases.</div>
            )}
          </CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Isolated Cases" subtitle="Isolation in effect" />
          <CardBody className="space-y-3">
            {isolated.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white font-semibold">{c.patientTag} · {c.infectionType}</p>
                  <p className="text-xs text-gray-500">{c.ward}</p>
                </div>
                <Badge size="sm" variant="info">Isolated</Badge>
              </div>
            ))}
            {isolated.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-6">No isolated cases.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
