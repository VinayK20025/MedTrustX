'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTTechDevicePanel, useOTTechDashboard } from '@/modules/ot-technician';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTTechDevicesPage() {
  const { data, isLoading } = useOTTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Equipment Status' }]} />
      <OTTechDevicePanel devices={data?.data?.devices ?? []} />
    </div>
  );
}
