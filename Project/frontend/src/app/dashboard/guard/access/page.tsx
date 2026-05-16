'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function GuardAccessPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Security Guard' }, { label: 'Visitor Access' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Visitor Check-In & ID Verification</p>
          <p className="text-sm">Scan visitor QR codes, issue passes, and log entry/exit times.</p>
        </CardBody>
      </Card>
    </div>
  );
}
