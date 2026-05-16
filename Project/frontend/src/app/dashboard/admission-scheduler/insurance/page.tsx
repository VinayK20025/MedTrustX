'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function InsurancePage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Admissions' }, { label: 'Insurance Pre-Authorization' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Pre-Auth Tracker</p>
          <p className="text-sm">Submit and track insurance pre-authorization requests.</p>
        </CardBody>
      </Card>
    </div>
  );
}
