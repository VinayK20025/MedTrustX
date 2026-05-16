'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyAssistantPanel, usePharmacyAssistantDashboard } from '@/modules/pharmacy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyAssistantServicePage() {
  const { data, isLoading } = usePharmacyAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Front Desk' }, { label: 'Active Service' }]} />
      <PharmacyAssistantPanel activeTask={data?.data?.activeTask} />
    </div>
  );
}
