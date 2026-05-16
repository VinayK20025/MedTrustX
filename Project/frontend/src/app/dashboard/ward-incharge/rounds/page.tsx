'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Ward Rounds'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Ward Rounds" 
        description="Conduct and document nursing rounds to verify patient status and care quality."
      />
    </div>
  );
}
