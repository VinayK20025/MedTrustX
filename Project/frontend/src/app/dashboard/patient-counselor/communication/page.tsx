'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function PatientCounselorCommunicationPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Counseling' }, { label: 'Notes & Messages' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Physician Messaging</p>
          <p className="text-sm">Send notes to the attending doctor regarding patient concerns or therapy refusal.</p>
        </CardBody>
      </Card>
    </div>
  );
}
