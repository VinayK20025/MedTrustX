'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'resident'} , {label:'Daily Rounds'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Daily Rounds" 
        description="Guided workflow for conducting and documenting morning patient rounds."
      />
    </div>
  );
}
