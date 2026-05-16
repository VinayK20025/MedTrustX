'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function TpaInpatientPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'TPA Desk' }, { label: 'Inpatient Updates' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Inpatient TPA Coordination</p>
          <p className="text-sm">Request enhancements and update insurers on active treatment costs.</p>
        </CardBody>
      </Card>
    </div>
  );
}
