'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { PlatformObservabilityPanel } from '@/modules/platform-engineer/components/PlatformObservabilityPanel';
import { usePlatformDashboard } from '@/modules/platform-engineer/hooks/usePlatformAnalytics';
import type { PlatformFilters } from '@/modules/platform-engineer/services/platform.api';

export default function PlatformEngineerObservabilityPage() {
  const [filters] = useState<PlatformFilters>({});
  const { data, isLoading } = usePlatformDashboard(filters);

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Platform Engineer' }, { label: 'Observability' }]} />
      
      {isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-xl" />
      ) : data?.data ? (
        <div className="h-[700px]">
          <PlatformObservabilityPanel metrics={data.data.metrics} />
        </div>
      ) : (
        <div className="text-gray-500 py-20 text-center">No data available</div>
      )}
    </div>
  );
}
