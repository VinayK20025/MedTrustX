'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useIomtDashboard } from '@/modules/iomt-device';

export default function IomtReportsPage() {
  const { data, isLoading } = useIomtDashboard();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const metrics = data?.data?.metrics;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Reports' }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Active Devices" />
          <CardBody>
            <p className="text-2xl font-bold text-white">{metrics?.activeDevices ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">of {metrics?.totalDevices ?? 0} total</p>
          </CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Data Stream Rate" />
          <CardBody>
            <p className="text-2xl font-bold text-white">{metrics?.dataTransmissionRate ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">msgs/min</p>
          </CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Security Incidents" />
          <CardBody>
            <p className="text-2xl font-bold text-white">{metrics?.securityIncidents ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">open in last 24h</p>
          </CardBody>
        </Card>
      </div>
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Operations Summary" subtitle="IoMT platform health overview" />
        <CardBody>
          <p className="text-sm text-gray-400">
            Authentication success rate is {metrics?.authSuccessRate ?? 0}% with {metrics?.activeDevices ?? 0} active devices streaming telemetry.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
