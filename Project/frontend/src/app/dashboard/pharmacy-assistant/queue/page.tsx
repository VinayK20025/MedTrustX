'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyAssistantQueue, usePharmacyAssistantDashboard } from '@/modules/pharmacy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyAssistantQueuePage() {
  const { data, isLoading } = usePharmacyAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Front Desk' }, { label: 'Customer Queue' }]} />
      <PharmacyAssistantQueue queue={data?.data?.queue ?? []} />
    </div>
  );
}
