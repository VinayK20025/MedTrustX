'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MicrobiologyAlertPanel, useMicrobiologyDashboard } from '@/modules/microbiology';
import { Skeleton } from '@/components/ui/Spinner';

export default function MicrobiologyAlertsPage() {
  const { data, isLoading } = useMicrobiologyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Pathogen Alerts' }]} />
      <MicrobiologyAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
