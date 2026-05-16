'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'nursing-superintendent'} , {label:'Incident Reports'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Incident Reports" 
        description="Review and resolve operational and clinical incident reports logged by nursing staff."
      />
    </div>
  );
}
