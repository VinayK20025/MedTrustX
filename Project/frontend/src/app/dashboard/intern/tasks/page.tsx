'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'intern'} , {label:'Assisted Tasks'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Assisted Tasks" 
        description="Track tasks you are assisting with under direct supervision."
      />
    </div>
  );
}
