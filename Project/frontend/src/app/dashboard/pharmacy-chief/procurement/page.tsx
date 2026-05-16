'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyChiefProcurementPanel, usePharmacyChiefDashboard } from '@/modules/pharmacy-chief';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyChiefProcurementPage() {
  const { data, isLoading } = usePharmacyChiefDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Purchase Orders' }]} />
      <PharmacyChiefProcurementPanel orders={data?.data?.purchaseOrders ?? []} />
    </div>
  );
}
