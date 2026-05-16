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

export default function BloodBankCompliancePage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Compliance', 'Screening adherence and discard logs');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const units = data?.data?.units ?? [];
  const reactive = units.filter((u) => u.screeningResult === 'Reactive');
  const expired = units.filter((u) => u.status === 'Expired' || new Date(u.expiresAt).getTime() < Date.now());

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Compliance' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Reactive Units" subtitle="Units flagged during screening" />
            <CardBody className="space-y-3">
              {reactive.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-emergency/10 border border-emergency/30">
                  <div>
                    <p className="text-sm text-white font-semibold">{unit.bloodGroup} · {unit.component}</p>
                    <p className="text-2xs text-gray-500">Unit {unit.id} · {unit.donorName}</p>
                  </div>
                  <Badge variant="danger" size="sm">Reactive</Badge>
                </div>
              ))}
              {reactive.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8">No reactive units recorded.</div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Expired Units" subtitle="Units past expiry window" />
            <CardBody className="space-y-3">
              {expired.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <div>
                    <p className="text-sm text-white font-semibold">{unit.bloodGroup} · {unit.component}</p>
                    <p className="text-2xs text-gray-500">Unit {unit.id} · {unit.donorName}</p>
                  </div>
                  <Badge variant="warning" size="sm">Expired</Badge>
                </div>
              ))}
              {expired.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8">No expired units recorded.</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
