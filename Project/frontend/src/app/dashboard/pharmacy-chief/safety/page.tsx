'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyChiefSafetyPanel, usePharmacyChiefDashboard } from '@/modules/pharmacy-chief';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyChiefSafetyPage() {
  const { data, isLoading } = usePharmacyChiefDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Adverse Events' }]} />
      <PharmacyChiefSafetyPanel events={data?.data?.adverseEvents ?? []} />
    </div>
  );
}
