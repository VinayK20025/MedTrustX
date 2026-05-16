'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FrontDeskAppointmentPanel, useFrontDeskDashboard } from '@/modules/front-desk';
import { Skeleton } from '@/components/ui/Spinner';

export default function FrontDeskAppointmentsPage() {
  const { data, isLoading } = useFrontDeskDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Appointment Scheduler' }]} />
      <div className="h-[700px]">
        <FrontDeskAppointmentPanel appointments={data?.data?.todayAppointments ?? []} />
      </div>
    </div>
  );
}
