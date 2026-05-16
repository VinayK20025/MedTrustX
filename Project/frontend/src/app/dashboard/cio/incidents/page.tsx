'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cio'} , {label:'Incident Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Incident Management" 
        description="War room for tracking P1/P2/P3 outtages, responder assignments, and post-mortems."
      />
    </div>
  );
}
