'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Records & Evidence Repository'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Records & Evidence Repository" 
        description="Track documentation completeness, manage evidence records, and identify missing compliance artifacts."
      />
    </div>
  );
}
