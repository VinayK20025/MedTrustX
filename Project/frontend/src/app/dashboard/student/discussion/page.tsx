'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'student'} , {label:'Case Discussions'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Case Discussions" 
        description="Participate in Q&A threads linked to specific clinical cases and academic modules."
      />
    </div>
  );
}
