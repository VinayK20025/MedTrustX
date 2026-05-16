'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'intern'} , {label:'Assigned Patients (Read-Only)'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="Assigned Patients (Read-Only)" 
        description="View-only access to patients assigned by your supervising resident."
      />
    </div>
  );
}
