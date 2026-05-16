'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function SchedulerWaitlistPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Appointment Waitlist' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Waitlist Queue</p>
          <p className="text-sm">Auto-fill cancelled slots and notify patients.</p>
        </CardBody>
      </Card>
    </div>
  );
}
