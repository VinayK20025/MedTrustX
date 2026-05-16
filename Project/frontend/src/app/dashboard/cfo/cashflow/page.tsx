'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cfo'} , {label:'Cash Flow Monitoring'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Cash Flow Monitoring" 
        description="Real-time inflow/outflow tracking, liquidity position, and balance trend analysis."
      />
    </div>
  );
}
