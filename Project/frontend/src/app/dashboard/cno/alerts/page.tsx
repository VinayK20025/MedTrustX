'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cno'} , {label:'Nursing Care Alerts'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Nursing Care Alerts" 
        description="Escalation panel for resolving immediate nursing incidents and resource emergencies."
      />
    </div>
  );
}
