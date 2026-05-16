'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'service-accounts'} , {label:'api-calls'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="api-calls Management" 
        description="Auto-generated production-grade data table powered by useAutoApi."
      />
    </div>
  );
}
