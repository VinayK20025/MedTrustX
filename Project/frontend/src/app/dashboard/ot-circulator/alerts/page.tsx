'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CirculatorAlertPanel, useCirculatorDashboard } from '@/modules/ot-circulator';
import { Skeleton } from '@/components/ui/Spinner';

export default function CirculatorAlertsPage() {
  const { data, isLoading } = useCirculatorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Alerts' }]} />
      <CirculatorAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
