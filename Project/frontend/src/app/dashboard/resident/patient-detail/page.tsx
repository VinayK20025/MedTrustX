'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'resident'} , {label:'Patient Detail'}]} />
      <GenericDataTable 
        endpointKey="ai" 
        title="Patient Detail" 
        description="Deep dive into patient history, vitals, labs, and active treatment plan."
      />
    </div>
  );
}
