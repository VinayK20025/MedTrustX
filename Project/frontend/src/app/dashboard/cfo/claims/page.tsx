'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cfo'} , {label:'Insurance Claims Management'}]} />
      <GenericDataTable 
        endpointKey="ai" 
        title="Insurance Claims Management" 
        description="Claim submission, approval workflows, rejection analysis, and provider reconciliation."
      />
    </div>
  );
}
