'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function BillingNewBillPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1000px]">
      <Breadcrumbs items={[{ label: 'Finance' }, { label: 'New Bill' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Create New Bill</p>
          <p className="text-sm">Search patient, auto-aggregate services, and generate a new billing record.</p>
        </CardBody>
      </Card>
    </div>
  );
}
