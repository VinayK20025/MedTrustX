'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cto'} , {label:'Performance Engineering'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Performance Engineering" 
        description="RED metrics (Rate, Errors, Duration), SLO adherence, saturation analysis per service."
      />
    </div>
  );
}
