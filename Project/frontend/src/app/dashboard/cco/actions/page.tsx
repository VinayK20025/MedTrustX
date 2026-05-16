'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Corrective Action Plans'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Corrective Action Plans" 
        description="Assign, track, and close corrective and preventive actions (CAPA) tied to violations and audit findings."
      />
    </div>
  );
}
