'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalPharmacyAlertPanel, useClinicalPharmacyDashboard } from '@/modules/clinical-pharmacy';
import { Skeleton } from '@/components/ui/Spinner';

export default function ClinicalPharmacyAlertsPage() {
  const { data, isLoading } = useClinicalPharmacyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pharmacy' }, { label: 'Safety Alerts' }]} />
      <ClinicalPharmacyAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
