'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhlebotomyPreparationPanel, usePhlebotomyDashboard } from '@/modules/phlebotomy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PhlebotomyPreparationPage() {
  const { data, isLoading } = usePhlebotomyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Safety Verification' }]} />
      <PhlebotomyPreparationPanel activePatient={data?.data?.activePatient} steps={data?.data?.verificationSteps ?? []} />
    </div>
  );
}
