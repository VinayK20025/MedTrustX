'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdmissionWizardPanel, useAdmissionSchedulerDashboard } from '@/modules/admission-scheduler';
import { Skeleton } from '@/components/ui/Spinner';

export default function NewAdmissionPage() {
  const { data, isLoading } = useAdmissionSchedulerDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Admissions' }, { label: 'New Admission' }]} />
      <div className="h-[700px]"><AdmissionWizardPanel beds={data?.data?.beds ?? []} /></div>
    </div>
  );
}
