'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

import { FrontDeskBillingPanel } from '@/modules/front-desk/components/FrontDeskBillingPanel';

export default function FrontDeskBillingPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Quick Billing' }]} />
      <div className="h-[600px]">
        <FrontDeskBillingPanel />
      </div>
    </div>
  );
}
