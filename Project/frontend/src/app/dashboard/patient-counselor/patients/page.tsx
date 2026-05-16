'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CounselorPatientList, usePatientCounselorDashboard } from '@/modules/patient-counselor';
import { Skeleton } from '@/components/ui/Spinner';

export default function PatientCounselorPatientsPage() {
  const { data, isLoading } = usePatientCounselorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Counseling' }, { label: 'Assigned Patients' }]} />
      <CounselorPatientList patients={data?.data?.patients ?? []} />
    </div>
  );
}
