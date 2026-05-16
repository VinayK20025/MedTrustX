'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'med-director'} , {label:'Clinical Audit Management'}]} />
      <GenericDataTable 
        endpointKey="audit" 
        title="Clinical Audit Management" 
        description="Schedule, track, and analyze clinical audits — mortality reviews, infection audits, and surgical outcome analysis."
      />
    </div>
  );
}
