'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Active Patients'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="Active Patients" 
        description="Full patient roster with acuity, diagnosis, attending doctor, LOS, and pending actions."
      />
    </div>
  );
}
