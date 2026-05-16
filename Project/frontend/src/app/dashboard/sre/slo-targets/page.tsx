'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sre'} , {label:'SLOs & SLAs'}]} />
      <GenericDataTable 
        endpointKey="ot" 
        title="SLOs & SLAs" 
        description="Service Level Objective definitions and error budget burn rate."
      />
    </div>
  );
}
