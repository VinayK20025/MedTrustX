'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTTechMaintenancePanel, useOTTechDashboard } from '@/modules/ot-technician';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTTechMaintenancePage() {
  const { data, isLoading } = useOTTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Maintenance Logs' }]} />
      <OTTechMaintenancePanel logs={data?.data?.recentMaintenance ?? []} />
    </div>
  );
}
