'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'doctor'} , {label:'Appointments & Rounds'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Appointments & Rounds" 
        description="Calendar view of OPD appointments, follow-ups, and scheduled ward rounds."
      />
    </div>
  );
}
