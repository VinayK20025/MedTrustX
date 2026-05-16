'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'resident'} , {label:'Shift Tasks'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Shift Tasks" 
        description="Detailed view of all pending, in-progress, and completed clinical tasks."
      />
    </div>
  );
}
