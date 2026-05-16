'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'locum'} , {label:'Shift Summary Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Shift Summary Reports" 
        description="End-of-shift reporting for billing and compliance."
      />
    </div>
  );
}
