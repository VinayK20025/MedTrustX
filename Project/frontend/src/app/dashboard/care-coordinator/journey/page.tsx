'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CareCoordinatorJourneyTimeline, useCareCoordinatorDashboard } from '@/modules/care-coordinator';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function CareCoordinatorJourneyPage() {
  const { data, isLoading } = useCareCoordinatorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Care Coordination' }, { label: 'Patient Journey' }]} />
        <CareCoordinatorJourneyTimeline activePatient={data?.data?.activePatient} milestones={data?.data?.journeyMilestones ?? []} />
      </div>
    </RoleGuard>
  );
}
