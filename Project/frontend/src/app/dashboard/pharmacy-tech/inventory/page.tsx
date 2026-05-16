'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyTechInventoryPanel, usePharmacyTechDashboard } from '@/modules/pharmacy-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyTechInventoryPage() {
  const { data, isLoading } = usePharmacyTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Tech' }, { label: 'Stock Lookup' }]} />
      <PharmacyTechInventoryPanel inventory={data?.data?.inventorySearch ?? []} />
    </div>
  );
}
