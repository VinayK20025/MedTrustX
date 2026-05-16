'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhlebotomyAlertPanel, usePhlebotomyDashboard } from '@/modules/phlebotomy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PhlebotomyAlertsPage() {
  const { data, isLoading } = usePhlebotomyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Safety Alerts' }]} />
      <PhlebotomyAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
