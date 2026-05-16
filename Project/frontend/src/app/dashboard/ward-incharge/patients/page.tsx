'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Ward Patients'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="Ward Patients" 
        description="View all patients currently admitted to your ward, their status, and assigned nurses."
      />
    </div>
  );
}
