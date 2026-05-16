'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyAssistantAlertPanel, usePharmacyAssistantDashboard } from '@/modules/pharmacy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyAssistantAlertsPage() {
  const { data, isLoading } = usePharmacyAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Front Desk' }, { label: 'Customer Alerts' }]} />
      <PharmacyAssistantAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
