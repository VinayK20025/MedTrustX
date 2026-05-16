'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cfo'} , {label:'Payments Tracking'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Payments Tracking" 
        description="Track outstanding receivables, payment status, and collection efficiency metrics."
      />
    </div>
  );
}
