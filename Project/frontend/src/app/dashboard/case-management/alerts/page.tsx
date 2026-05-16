'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CaseManagerAlertPanel, useCaseManagerDashboard } from '@/modules/case-management';
import { Skeleton } from '@/components/ui/Spinner';

export default function CaseManagerAlertsPage() {
  const { data, isLoading } = useCaseManagerDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Case Management' }, { label: 'Case Escalations' }]} />
      <CaseManagerAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
