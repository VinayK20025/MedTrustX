'use client';
import React, { useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { useBloodBankDashboard, useIssueUnit } from '@/modules/blood-bank';
import { useUIStore } from '@/store/ui.store';

export default function BloodBankIssuancePage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});
  const { mutate: issueUnit } = useIssueUnit();

  useEffect(() => {
    setPageMeta('Blood Bank Issuance', 'Release units for transfusion');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const units = (data?.data?.units ?? []).filter((u) => u.status === 'Available' && u.screeningResult === 'Clear');

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Issuance' }]} />
        <Card>
          <CardHeader title="Available Units" subtitle="Ready for transfusion" />
          <CardBody className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white font-semibold">{unit.bloodGroup} · {unit.component}</p>
                  <p className="text-2xs text-gray-500">Unit {unit.id} · {unit.donorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Available</Badge>
                  <Button size="sm" variant="secondary" onClick={() => issueUnit({ unitId: unit.id, patientId: 'patient' })}>Issue</Button>
                </div>
              </div>
            ))}
            {units.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">No units ready for issuance.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
