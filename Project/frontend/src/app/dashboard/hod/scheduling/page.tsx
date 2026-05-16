'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Scheduling & OT Cases'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Scheduling & OT Cases" 
        description="Calendar view of surgeries, procedures, and surgeon assignments with delay tracking."
      />
    </div>
  );
}
