'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sr'} , {label:'Team Activity Tracking'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Team Activity Tracking" 
        description="Monitor workload, active tasks, and delays across your junior residents and interns."
      />
    </div>
  );
}
