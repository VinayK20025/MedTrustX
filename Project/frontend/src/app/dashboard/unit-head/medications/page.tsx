'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'unit-head'} , {label:'Medication Tracking'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Medication Tracking" 
        description="Drug administration schedule, infusion monitoring, and delay alerts."
      />
    </div>
  );
}
