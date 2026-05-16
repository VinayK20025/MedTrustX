'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PsychologyAssessmentPanel, usePsychologyDashboard } from '@/modules/psychology';
import { Skeleton } from '@/components/ui/Spinner';

export default function PsychologyAssessmentPage() {
  const { data, isLoading } = usePsychologyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Mental Health' }, { label: 'Assessments' }]} />
      <PsychologyAssessmentPanel assessments={data?.data?.assessments ?? []} />
    </div>
  );
}
