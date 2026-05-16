'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DischargePatientList, useDischargeDashboard } from '@/modules/discharge';
import { Skeleton } from '@/components/ui/Spinner';

export default function DischargePendingPage() {
  const { data, isLoading } = useDischargeDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  const pending = (data?.data?.patients ?? []).filter(p => p.status !== 'Completed');
  return (
    <div className="space-y-5 animate-fade-in max-w-[800px]">
      <Breadcrumbs items={[{ label: 'Patient Flow' }, { label: 'Pending Discharges' }]} />
      <div className="h-[700px]"><DischargePatientList patients={pending} onSelect={() => {}} /></div>
    </div>
  );
}
