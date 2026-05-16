'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'unit-head'} , {label:'Staff Allocation'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Staff Allocation" 
        description="Intensivist, nurse, and RT bed assignments with shift monitoring."
      />
    </div>
  );
}
