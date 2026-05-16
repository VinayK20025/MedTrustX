'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function SocialWorkerFollowupPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Social Work' }, { label: 'Follow-up Tracking' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Post-Discharge Tracking</p>
          <p className="text-sm">Monitor patients after they leave the hospital to prevent readmissions.</p>
        </CardBody>
      </Card>
    </div>
  );
}
