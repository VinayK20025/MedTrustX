'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyChiefInventoryPanel, usePharmacyChiefDashboard } from '@/modules/pharmacy-chief';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyChiefInventoryPage() {
  const { data, isLoading } = usePharmacyChiefDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Drug Inventory' }]} />
      <PharmacyChiefInventoryPanel inventory={data?.data?.inventory ?? []} />
    </div>
  );
}
