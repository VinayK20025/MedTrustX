'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sre'} , {label:'Automation Runbooks'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Automation Runbooks" 
        description="Executable scripts for auto-remediation and diagnostics."
      />
    </div>
  );
}
