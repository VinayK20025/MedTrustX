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

export default function BloodBankCollectionPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Collection', 'Recent collection and screening intake');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const units = data?.data?.units ?? [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recentUnits = units.filter((u) => u.status === 'Screening' || new Date(u.collectedAt).getTime() >= cutoff);

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Collection' }]} />
        <Card>
          <CardHeader title="Collection Intake" subtitle="Units collected in the last 24 hours" />
          <CardBody className="space-y-3">
            {recentUnits.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white font-semibold">{unit.donorName}</p>
                  <p className="text-xs text-gray-500">{unit.bloodGroup} · {unit.component}</p>
                  <p className="text-2xs text-gray-600">Collected {new Date(unit.collectedAt).toLocaleString()}</p>
                </div>
                <Badge variant={unit.status === 'Screening' ? 'warning' : 'success'} size="sm">
                  {unit.status}
                </Badge>
              </div>
            ))}
            {recentUnits.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">No recent collections available.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
