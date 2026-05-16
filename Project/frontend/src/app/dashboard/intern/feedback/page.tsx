'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'intern'} , {label:'Supervisor Feedback'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Supervisor Feedback" 
        description="Review feedback and ratings from your supervising residents and consultants."
      />
    </div>
  );
}
