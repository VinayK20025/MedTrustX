'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function FrontDeskHelpDeskPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Help Desk & Enquiries' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Enquiry Desk</p>
          <p className="text-sm">Search departments, lookup doctor availability, and guide patients.</p>
        </CardBody>
      </Card>
    </div>
  );
}
