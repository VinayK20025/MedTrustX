'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'gp'} , {label:'Daily Summary'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Daily Summary" 
        description="Triage stats, patient volume, average wait times, and end-of-shift reports."
      />
    </div>
  );
}
