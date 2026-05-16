'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'nursing-superintendent'} , {label:'Ward Coverage Status'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Ward Coverage Status" 
        description="Monitor nurse-to-patient ratios across all hospital wards in real time."
      />
    </div>
  );
}
