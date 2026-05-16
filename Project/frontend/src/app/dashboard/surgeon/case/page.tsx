'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'surgeon'} , {label:'Surgical Case Workspace'}]} />
      <GenericDataTable 
        endpointKey="caseManagement" 
        title="Surgical Case Workspace" 
        description="Deep clinical review including imaging viewer, surgical plan, and timeline."
      />
    </div>
  );
}
