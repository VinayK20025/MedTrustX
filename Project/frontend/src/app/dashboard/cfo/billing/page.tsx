'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cfo'} , {label:'Billing & Revenue Streams'}]} />
      <GenericDataTable 
        endpointKey="billing" 
        title="Billing & Revenue Streams" 
        description="Invoice management, department-wise revenue breakdown, and billing accuracy tracking."
      />
    </div>
  );
}
