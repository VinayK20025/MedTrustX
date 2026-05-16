'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Audit Reports'}]} />
      <GenericDataTable 
        endpointKey="audit" 
        title="Audit Reports" 
        description="Generate and export completed audit reports with findings, scores, and corrective action summaries."
      />
    </div>
  );
}
