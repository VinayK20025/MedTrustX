'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'doctor'} , {label:'Pending Tasks'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Pending Tasks" 
        description="Review reports, update notes, and complete patient-specific tasks."
      />
    </div>
  );
}
