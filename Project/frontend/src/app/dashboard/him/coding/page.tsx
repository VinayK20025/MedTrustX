'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function HimCodingPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Governance' }, { label: 'Coding Standards' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">SNOMED & ICD-10 Updates</p>
          <p className="text-sm">Manage system-wide adoption of new clinical coding versions.</p>
        </CardBody>
      </Card>
    </div>
  );
}
