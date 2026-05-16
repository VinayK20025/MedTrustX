'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sr'} , {label:'Patient Detail'}]} />
      <GenericDataTable 
        endpointKey="ai" 
        title="Patient Detail" 
        description="Deep clinical view and direct task assignment panel for the patient."
      />
    </div>
  );
}
