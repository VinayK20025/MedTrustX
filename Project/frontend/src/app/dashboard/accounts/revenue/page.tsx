'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

import { RevenuePanel, useCfoDashboard } from '@/modules/cfo';

export default function Page() {

  const { data, isLoading } = useCfoDashboard({ period: 'mtd' });
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Revenue & Collections' }]} />
      <div className="h-[420px]">
        {isLoading ? (
          <div className="text-gray-500 flex items-center justify-center h-full">Loading revenue data...</div>
        ) : (
          <RevenuePanel data={data?.data?.revenueTrends ?? []} />
        )}
      </div>
    </div>
  );
}
