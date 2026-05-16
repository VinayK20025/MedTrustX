'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function DischargeFollowUpPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Patient Flow' }, { label: 'Follow-Up Scheduling' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Post-Discharge Follow-Up</p>
          <p className="text-sm">Schedule follow-up appointments and send reminders to patients.</p>
        </CardBody>
      </Card>
    </div>
  );
}
