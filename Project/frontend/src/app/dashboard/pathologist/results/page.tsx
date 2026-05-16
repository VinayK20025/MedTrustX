'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PathologistResultsTable, usePathologistDashboard } from '@/modules/pathologist';
import { Skeleton } from '@/components/ui/Spinner';

export default function PathologistResultsPage() {
  const { data, isLoading } = usePathologistDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Lab Results' }]} />
      <PathologistResultsTable activeCase={data?.data?.activeCase} results={data?.data?.activeResults} />
    </div>
  );
}
