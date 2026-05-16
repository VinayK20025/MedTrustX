'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Case Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Case Management" 
        description="Elective, emergency, and follow-up cases with treatment plan approval and escalation."
      />
    </div>
  );
}
