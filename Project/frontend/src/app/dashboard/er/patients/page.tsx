'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'er'} , {label:'Active ER Patients'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="Active ER Patients" 
        description="Currently admitted patients in the ER receiving stabilization and treatment."
      />
    </div>
  );
}
