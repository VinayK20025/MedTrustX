'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard, useRaiseAuditAction } from '@/modules/infection-control';

export default function InfectionAuditsPage() {
  const { data, isLoading } = useInfectionControlDashboard({});
  const { mutate: raiseAction } = useRaiseAuditAction();

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const audits = data?.data?.audits ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Audits' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Hygiene Audits" subtitle="Recent compliance inspections" />
        <CardBody className="space-y-3">
          {audits.map((audit) => (
            <div key={audit.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-semibold">{audit.area}</p>
                  <p className="text-xs text-gray-500">{audit.ward} · {new Date(audit.auditedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{audit.score}%</p>
                  <p className="text-2xs text-gray-500">{audit.status}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{audit.findings}</p>
              {audit.status !== 'Pass' && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    className="h-7 text-[10px] bg-warning/15 hover:bg-warning/25 text-warning-light border border-warning/30"
                    onClick={() => raiseAction(audit.id)}
                  >
                    Raise Action
                  </Button>
                </div>
              )}
            </div>
          ))}
          {audits.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No audits available.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
