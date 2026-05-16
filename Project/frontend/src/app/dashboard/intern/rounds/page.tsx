'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'intern'} , {label:'Assisted Rounds'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Assisted Rounds" 
        description="Follow along with senior rounds and record learning observations."
      />
    </div>
  );
}
