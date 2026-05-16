'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Audit Management'}]} />
      <GenericDataTable 
        endpointKey="audit" 
        title="Audit Management" 
        description="Schedule, assign, and track internal/external/regulatory audits with checklist-based findings."
      />
    </div>
  );
}
