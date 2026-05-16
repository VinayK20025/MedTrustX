'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'unit-head'} , {label:'Critical Alerts & Escalations'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Critical Alerts & Escalations" 
        description="Code Blue, vitals alerts, ventilator warnings, med delays — acknowledge and resolve."
      />
    </div>
  );
}
