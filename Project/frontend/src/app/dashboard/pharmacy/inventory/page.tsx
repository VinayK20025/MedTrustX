'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyInventoryPanel, usePharmacyDashboard } from '@/modules/pharmacy';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyInventoryPage() {
  const { data, isLoading } = usePharmacyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Inventory Search' }]} />
      <PharmacyInventoryPanel inventory={data?.data?.inventorySearch ?? []} />
    </div>
  );
}
