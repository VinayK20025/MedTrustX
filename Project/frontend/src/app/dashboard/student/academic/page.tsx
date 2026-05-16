'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'student'} , {label:'Academic Modules'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Academic Modules" 
        description="Core library of clinical pathways, protocols, and required reading material."
      />
    </div>
  );
}
