'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard, useIsolatePatient } from '@/modules/infection-control';

export default function InfectionCasesPage() {
  const { data, isLoading } = useInfectionControlDashboard({});
  const { mutate: isolate } = useIsolatePatient();

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const cases = data?.data?.cases ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Cases' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Case Registry" subtitle="HAI investigations and status" />
        <CardBody className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <div>
                <p className="text-sm text-white font-semibold">{c.patientTag} · {c.infectionType}</p>
                <p className="text-xs text-gray-500">{c.ward} · {new Date(c.reportedAt).toLocaleString()}</p>
                <p className="text-2xs text-gray-600">{c.labConfirmed ? 'Lab confirmed' : 'Pending lab confirmation'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  size="sm"
                  variant={c.status === 'Active' ? 'danger' : c.status === 'Under Investigation' ? 'warning' : 'success'}
                >
                  {c.status}
                </Badge>
                {c.isolated ? (
                  <Badge size="sm" variant="info">Isolated</Badge>
                ) : (
                  <button
                    className="text-xs text-orange-300 hover:text-orange-200"
                    onClick={() => isolate(c.id)}
                  >
                    Isolate
                  </button>
                )}
              </div>
            </div>
          ))}
          {cases.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No infection cases available.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
