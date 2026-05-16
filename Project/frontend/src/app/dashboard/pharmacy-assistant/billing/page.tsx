'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyAssistantBillingPanel } from '@/modules/pharmacy-assistant';

export default function PharmacyAssistantBillingPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Front Desk' }, { label: 'Point of Sale' }]} />
      <PharmacyAssistantBillingPanel />
    </div>
  );
}
