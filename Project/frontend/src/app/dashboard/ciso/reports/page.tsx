'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';
import { RoleGuard } from '@/components/guards/AuthGuard';


export default function Page() {
  return (
    <RoleGuard roles={['ciso', 'enterprise-security', 'security-root', 'super_admin']} requireAll={false}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ciso'} , {label:'Security Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Security Reports" 
        description="Generate compliance reports, threat summaries, and access audit exports for governance review."
      />
    </div>
    </RoleGuard>
  );
}
