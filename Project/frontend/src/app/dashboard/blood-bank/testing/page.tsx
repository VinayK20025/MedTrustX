'use client';
import React, { useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { useBloodBankDashboard } from '@/modules/blood-bank';
import { useUIStore } from '@/store/ui.store';

export default function BloodBankTestingPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Testing', 'Screening and serology workflow');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const units = (data?.data?.units ?? []).filter((u) => u.screeningResult === 'Pending' || u.status === 'Screening');

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Testing' }]} />
        <Card>
          <CardHeader title="Pending Screening" subtitle="Units awaiting testing or validation" />
          <CardBody className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white font-semibold">{unit.bloodGroup} · {unit.component}</p>
                  <p className="text-2xs text-gray-500">Unit {unit.id} · {unit.donorName}</p>
                </div>
                <Badge variant="warning" size="sm">{unit.screeningResult}</Badge>
              </div>
            ))}
            {units.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">No pending screening units.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
