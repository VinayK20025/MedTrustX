'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'intern'} , {label:'Learning Summary'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Learning Summary" 
        description="Track your completed learning modules and clinical exposure hours."
      />
    </div>
  );
}
