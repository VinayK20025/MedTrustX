'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AnesthesiaAlertPanel, useAnesthesiaTechDashboard } from '@/modules/anesthesia-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function AnesthesiaAlertsPage() {
  const { data, isLoading } = useAnesthesiaTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Anesthesia Dept' }, { label: 'Gas Alerts' }]} />
      <AnesthesiaAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
