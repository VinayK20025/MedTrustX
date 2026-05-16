'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sr'} , {label:'Task Delegation Board'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Task Delegation Board" 
        description="Assign unassigned tasks to your team and monitor progress."
      />
    </div>
  );
}
