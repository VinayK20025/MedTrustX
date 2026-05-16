'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cto'} , {label:'Repository Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Repository Management" 
        description="Code quality metrics, commit activity, contributor stats, and code coverage per repository."
      />
    </div>
  );
}
