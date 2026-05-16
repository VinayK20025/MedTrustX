'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'intern'} , {label:'Learning Modules'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Learning Modules" 
        description="Access case-based learning protocols linked to your assigned patients."
      />
    </div>
  );
}
