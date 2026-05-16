'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyBillingPanel } from '@/modules/pharmacy';

export default function PharmacyBillingPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Payment & Billing' }]} />
      <PharmacyBillingPanel />
    </div>
  );
}
