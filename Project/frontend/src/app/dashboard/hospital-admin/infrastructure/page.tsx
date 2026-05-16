'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function AdminInfrastructurePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Infrastructure & Equipment' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[500px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Equipment Status</p>
          <p className="text-sm">Track maintenance schedules and downtime for critical hospital infrastructure.</p>
        </CardBody>
      </Card>
    </div>
  );
}
