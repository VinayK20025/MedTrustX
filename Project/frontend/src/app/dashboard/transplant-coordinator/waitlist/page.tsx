'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { WaitlistPanel } from '@/modules/transplant';
import { useTransplantAnalytics } from '@/modules/transplant';

export default function WaitlistRoute() {
  const { data, isLoading } = useTransplantAnalytics();

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Transplant Coordinator' }, { label: 'Waitlist' }]} />
      
      {isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-xl" />
      ) : data?.data ? (
        <div className="h-[700px]">
          <WaitlistPanel waitlist={data.data.waitlist} />
        </div>
      ) : (
        <div className="text-gray-500 py-20 text-center">No data available</div>
      )}
    </div>
  );
}
