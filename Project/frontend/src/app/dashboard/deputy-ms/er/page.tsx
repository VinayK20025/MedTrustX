'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'deputy-ms'} , {label:'Emergency Room Flow'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Emergency Room Flow" 
        description="ER triage queue, priority levels, and staff assignment for emergency coordination."
      />
    </div>
  );
}
