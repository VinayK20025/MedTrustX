'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTAssistantActiveCasePanel, useOTAssistantDashboard } from '@/modules/ot-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTAssistantCasesPage() {
  const { data, isLoading } = useOTAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Cases' }]} />
      <OTAssistantActiveCasePanel activeCase={data?.data?.activeCase} upcomingCases={data?.data?.upcomingCases ?? []} />
    </div>
  );
}
