'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Critical Alerts'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Critical Alerts" 
        description="Patient-specific and workload alerts requiring immediate HOD intervention."
      />
    </div>
  );
}
