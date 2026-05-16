'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useIomtDashboard } from '@/modules/iomt-device';

export default function IomtStreamPage() {
  const { data, isLoading } = useIomtDashboard();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const stream = data?.data?.liveData ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Live Stream' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Live Telemetry" subtitle="Most recent device signals" />
        <CardBody>
          {stream.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No telemetry available.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stream.map((item, idx) => (
                <div key={`${item.deviceId}-${idx}`} className="bg-surface rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.metricName}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <span className="text-xs text-gray-500">{item.unit}</span>
                  </div>
                  <p className="text-[10px] text-indigo-300 font-mono mt-3 truncate">{item.deviceId}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
