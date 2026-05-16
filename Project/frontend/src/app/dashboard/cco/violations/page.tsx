'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Violations Tracking'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Violations Tracking" 
        description="Full lifecycle management of compliance violations — detection, assignment, resolution, and closure."
      />
    </div>
  );
}
