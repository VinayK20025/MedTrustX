'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'icn'} , {label:'Hospital-Acquired Infections (HAIs)'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Hospital-Acquired Infections (HAIs)" 
        description="List of all active, isolated, and under-observation infection cases."
      />
    </div>
  );
}
