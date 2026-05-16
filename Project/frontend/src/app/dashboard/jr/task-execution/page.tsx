'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'jr'} , {label:'Guided Execution Screen'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Guided Execution Screen" 
        description="Full-screen step-by-step procedure execution with safety validations."
      />
    </div>
  );
}
