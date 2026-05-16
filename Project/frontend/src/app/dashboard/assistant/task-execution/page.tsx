'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'assistant'} , {label:'Guided Task Execution'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Guided Task Execution" 
        description="Step-by-step instructions for basic care procedures."
      />
    </div>
  );
}
