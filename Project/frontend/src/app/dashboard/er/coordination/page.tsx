'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'er'} , {label:'ICU & OT Coordination'}]} />
      <GenericDataTable 
        endpointKey="careCoordination" 
        title="ICU & OT Coordination" 
        description="Request emergency OT slots, ICU transfers, and specialist consultations."
      />
    </div>
  );
}
