'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'jr'} , {label:'Clinical Protocols Library'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Clinical Protocols Library" 
        description="Embedded learning, procedure guides, and best-practice protocols."
      />
    </div>
  );
}
