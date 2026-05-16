'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function TrainingCompliancePage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Training' }, { label: 'Mandatory Compliance' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Mandatory Training Compliance</p>
          <p className="text-sm">Track completion of required courses: BLS, ACLS, Infection Control, Fire Safety.</p>
        </CardBody>
      </Card>
    </div>
  );
}
