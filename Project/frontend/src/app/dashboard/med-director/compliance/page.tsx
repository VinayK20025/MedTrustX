'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'med-director'} , {label:'NABH / JCI Compliance'}]} />
      <GenericDataTable 
        endpointKey="compliance" 
        title="NABH / JCI Compliance" 
        description="Accreditation standard tracking, pre-assessment readiness, and compliance gap analysis."
      />
    </div>
  );
}
