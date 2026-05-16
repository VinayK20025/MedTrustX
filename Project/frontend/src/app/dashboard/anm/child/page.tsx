'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'anm'} , {label:'Growth Monitoring'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Growth Monitoring" 
        description="Track child growth metrics and nutrition status."
      />
    </div>
  );
}
