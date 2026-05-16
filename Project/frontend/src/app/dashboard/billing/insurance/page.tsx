'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function BillingInsurancePage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Insurance Claims' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Insurance Claims Tracker</p>
          <p className="text-sm">Submit, track, and manage insurance pre-authorizations and claims.</p>
        </CardBody>
      </Card>
    </div>
  );
}
