'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sr'} , {label:'Ward Patient Management'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="Ward Patient Management" 
        description="Full control over all patients admitted to your assigned wards."
      />
    </div>
  );
}
