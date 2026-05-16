'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cio'} , {label:'Infrastructure Monitoring'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Infrastructure Monitoring" 
        description="Node-level CPU, Memory, and Network I/O metrics for the underlying cluster."
      />
    </div>
  );
}
