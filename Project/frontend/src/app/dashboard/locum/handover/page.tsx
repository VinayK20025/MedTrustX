'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'locum'} , {label:'Incoming & Outgoing Handover'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Incoming & Outgoing Handover" 
        description="Critical instructions passed from previous shifts and your outgoing notes."
      />
    </div>
  );
}
