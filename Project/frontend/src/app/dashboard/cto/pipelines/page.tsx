'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cto'} , {label:'CI/CD Pipeline Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="CI/CD Pipeline Management" 
        description="Build status, deployment history, rollback triggers, and pipeline performance analytics."
      />
    </div>
  );
}
