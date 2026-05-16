'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'icn'} , {label:'Outbreak Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Outbreak Management" 
        description="Trace sources, isolate affected areas, and escalate action plans."
      />
    </div>
  );
}
