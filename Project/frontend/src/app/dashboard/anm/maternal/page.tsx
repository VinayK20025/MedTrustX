'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'anm'} , {label:'ANC Tracking'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="ANC Tracking" 
        description="Track antenatal care visits and high-risk markers."
      />
    </div>
  );
}
