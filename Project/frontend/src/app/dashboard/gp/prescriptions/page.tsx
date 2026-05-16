'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'gp'} , {label:'Prescriptions'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Prescriptions" 
        description="Drug ordering with rapid templates for common GP presentations."
      />
    </div>
  );
}
