'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PrmFeedbackPanel, usePrmDashboard } from '@/modules/prm';
import { Skeleton } from '@/components/ui/Spinner';

export default function PrmFeedbackPage() {
  const { data, isLoading } = usePrmDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Experience' }, { label: 'Feedback & Ratings' }]} />
      <PrmFeedbackPanel feedback={data?.data?.recentFeedback ?? []} />
    </div>
  );
}
