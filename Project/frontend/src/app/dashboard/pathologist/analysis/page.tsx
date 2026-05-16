'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PathologistAnalysisPanel, usePathologistDashboard } from '@/modules/pathologist';
import { Skeleton } from '@/components/ui/Spinner';

export default function PathologistAnalysisPage() {
  const { data, isLoading } = usePathologistDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Trend Analysis' }]} />
      <PathologistAnalysisPanel activeCase={data?.data?.activeCase} results={data?.data?.activeResults} />
    </div>
  );
}
