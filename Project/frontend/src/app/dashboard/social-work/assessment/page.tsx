'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SocialWorkAssessmentPanel, useSocialWorkDashboard } from '@/modules/social-work';
import { Skeleton } from '@/components/ui/Spinner';

export default function SocialWorkerAssessmentPage() {
  const { data, isLoading } = useSocialWorkDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Social Work' }, { label: 'Psychosocial Assessment' }]} />
      <SocialWorkAssessmentPanel assessment={data?.data?.activeAssessment} />
    </div>
  );
}
