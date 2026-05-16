'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function FrontDeskReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Daily Logs & Reports' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Reception Daily Logs</p>
          <p className="text-sm">View registrations, walk-ins, appointment conversions, and queue throughput.</p>
        </CardBody>
      </Card>
    </div>
  );
}
