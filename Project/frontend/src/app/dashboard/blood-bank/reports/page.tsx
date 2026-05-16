'use client';
import React, { useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { useBloodBankDashboard } from '@/modules/blood-bank';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/utils/cn';

export default function BloodBankReportsPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Reports', 'Daily operational summary');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const kpis = data?.data?.kpis ?? [];

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Reports' }]} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className={cn('p-4', kpi.status === 'critical' && 'border-emergency/30')}> 
              <CardHeader title={kpi.label} />
              <CardBody>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader title="Report Notes" subtitle="Use these metrics for daily reporting" />
          <CardBody>
            <p className="text-sm text-gray-400">Exported summaries include inventory availability, screening throughput, and transfusion issuance volume.</p>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
