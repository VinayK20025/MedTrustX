'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function AppSupportMonitoringPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'IT Operations' }, { label: 'Application Monitoring' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Service Health & Jobs</p>
          <p className="text-sm">Monitor EMR/LIS uptime, response times, and background job failures.</p>
        </CardBody>
      </Card>
    </div>
  );
}
