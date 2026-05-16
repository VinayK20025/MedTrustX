'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FrontDeskRegistrationPanel } from '@/modules/front-desk';

export default function FrontDeskRegisterPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'New Patient Registration' }]} />
      <FrontDeskRegistrationPanel />
    </div>
  );
}
