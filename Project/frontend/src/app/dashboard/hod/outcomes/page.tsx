'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Clinical Outcomes'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Clinical Outcomes" 
        description="Mortality, success rate, complications, readmissions — department benchmarks and trends."
      />
    </div>
  );
}
