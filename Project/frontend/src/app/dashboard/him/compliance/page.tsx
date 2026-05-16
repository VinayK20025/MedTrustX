'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HimCompliancePanel, useHimDashboard } from '@/modules/him';
import { Skeleton } from '@/components/ui/Spinner';

export default function HimCompliancePage() {
  const { data, isLoading } = useHimDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Governance' }, { label: 'Compliance Dashboard' }]} />
      <HimCompliancePanel violations={data?.data?.violations ?? []} />
    </div>
  );
}
