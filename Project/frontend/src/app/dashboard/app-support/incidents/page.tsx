'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function AppSupportIncidentsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'IT Operations' }, { label: 'Active Incidents' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Incident Management</p>
          <p className="text-sm">Track and resolve Sev-1/Sev-2 application failures and queue blockages.</p>
        </CardBody>
      </Card>
    </div>
  );
}
