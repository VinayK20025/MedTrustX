'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function MroRequestsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Health Information Management' }, { label: 'Record Requests' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Subpoenas & External Requests</p>
          <p className="text-sm">Manage authorizations for releasing medical records to insurance or legal teams.</p>
        </CardBody>
      </Card>
    </div>
  );
}
