'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'Enterprise Service Registry'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Enterprise Service Registry" 
        description="Holistic view of all clinical and administrative systems."
      />
    </div>
  );
}
