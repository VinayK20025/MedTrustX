'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Policy & SOP Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Policy & SOP Management" 
        description="Create, version, publish, and track adherence to Standard Operating Procedures across departments."
      />
    </div>
  );
}
