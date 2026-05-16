'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SurgeonActiveSurgeryPanel, SurgeonVitalsPanel, useSurgeonDashboard } from '@/modules/surgeon';
import { Skeleton } from '@/components/ui/Spinner';

export default function SurgeonIntraOpPage() {
  const { data, isLoading } = useSurgeonDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Surgical Department' }, { label: 'Intra-Op Control' }]} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
         <div className="xl:col-span-5">
           <SurgeonVitalsPanel vitals={data?.data?.liveVitals} />
         </div>
         <div className="xl:col-span-7">
           <SurgeonActiveSurgeryPanel surgery={data?.data?.activeSurgery} />
         </div>
      </div>
    </div>
  );
}
